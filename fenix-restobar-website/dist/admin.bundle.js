const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === "object" && keyOrEdits !== null ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => ({ ...prev, ...edits }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*");
    window.dispatchEvent(new CustomEvent("tweakchange", { detail: edits }));
  }, []);
  return [values, setTweak];
}
function TweaksPanel({ title = "Tweaks", noDeckControls = false, defaultOpen = false, children }) {
  const [open, setOpen] = React.useState(() => {
    if (defaultOpen) return true;
    try {
      return new URLSearchParams(window.location.search).get("tweaks") === "1";
    } catch (_) {
      return false;
    }
  });
  const dragRef = React.useRef(null);
  const hasDeckStage = React.useMemo(
    () => typeof document !== "undefined" && !!document.querySelector("deck-stage"),
    []
  );
  const [railEnabled, setRailEnabled] = React.useState(
    () => hasDeckStage && !!document.querySelector("deck-stage")?._railEnabled
  );
  React.useEffect(() => {
    if (!hasDeckStage || railEnabled) return void 0;
    const onMsg = (e) => {
      if (e.data && e.data.type === "__omelette_rail_enabled") setRailEnabled(true);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [hasDeckStage, railEnabled]);
  const [railVisible, setRailVisible] = React.useState(() => {
    try {
      return localStorage.getItem("deck-stage.railVisible") !== "0";
    } catch (e) {
      return true;
    }
  });
  const toggleRail = (on) => {
    setRailVisible(on);
    window.postMessage({ type: "__deck_rail_visible", on }, "*");
  };
  const offsetRef = React.useRef({ x: 16, y: 16 });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + "px";
    panel.style.bottom = offsetRef.current.y + "px";
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", clampToViewport);
      return () => window.removeEventListener("resize", clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = (e) => {
      const t = e?.data?.type;
      if (t === "__activate_edit_mode") setOpen(true);
      else if (t === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };
  const onDragStart = (e) => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = (ev) => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  if (!open) return null;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("style", null, __TWEAKS_STYLE), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: dragRef,
      className: "twk-panel",
      "data-noncommentable": "",
      style: { right: offsetRef.current.x, bottom: offsetRef.current.y }
    },
    /* @__PURE__ */ React.createElement("div", { className: "twk-hd", onMouseDown: onDragStart }, /* @__PURE__ */ React.createElement("b", null, title), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "twk-x",
        "aria-label": "Close tweaks",
        onMouseDown: (e) => e.stopPropagation(),
        onClick: dismiss
      },
      "\u2715"
    )),
    /* @__PURE__ */ React.createElement("div", { className: "twk-body" }, children, hasDeckStage && railEnabled && !noDeckControls && /* @__PURE__ */ React.createElement(TweakSection, { label: "Deck" }, /* @__PURE__ */ React.createElement(TweakToggle, { label: "Thumbnail rail", value: railVisible, onChange: toggleRail })))
  ));
}
function TweakSection({ label, children }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "twk-sect" }, label), children);
}
function TweakRow({ label, value, children, inline = false }) {
  return /* @__PURE__ */ React.createElement("div", { className: inline ? "twk-row twk-row-h" : "twk-row" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label), value != null && /* @__PURE__ */ React.createElement("span", { className: "twk-val" }, value)), children);
}
function TweakSlider({ label, value, min = 0, max = 100, step = 1, unit = "", onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label, value: `${value}${unit}` }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      className: "twk-slider",
      min,
      max,
      step,
      value,
      onChange: (e) => onChange(Number(e.target.value))
    }
  ));
}
function TweakToggle({ label, value, onChange }) {
  return /* @__PURE__ */ React.createElement("div", { className: "twk-row twk-row-h" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label)), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "twk-toggle",
      "data-on": value ? "1" : "0",
      role: "switch",
      "aria-checked": !!value,
      onClick: () => onChange(!value)
    },
    /* @__PURE__ */ React.createElement("i", null)
  ));
}
function TweakRadio({ label, value, options, onChange }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const labelLen = (o) => String(typeof o === "object" ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({ 2: 16, 3: 10 }[options.length] ?? 0);
  if (!fitsAsSegments) {
    const resolve = (s) => {
      const m = options.find((o) => String(typeof o === "object" ? o.value : o) === s);
      return m === void 0 ? s : typeof m === "object" ? m.value : m;
    };
    return /* @__PURE__ */ React.createElement(
      TweakSelect,
      {
        label,
        value,
        options,
        onChange: (s) => onChange(resolve(s))
      }
    );
  }
  const opts = options.map((o) => typeof o === "object" ? o : { value: o, label: o });
  const idx = Math.max(0, opts.findIndex((o) => o.value === value));
  const n = opts.length;
  const segAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = (e) => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = (ev) => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: trackRef,
      role: "radiogroup",
      onPointerDown,
      className: dragging ? "twk-seg dragging" : "twk-seg"
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "twk-seg-thumb",
        style: {
          left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
          width: `calc((100% - 4px) / ${n})`
        }
      }
    ),
    opts.map((o) => /* @__PURE__ */ React.createElement("button", { key: o.value, type: "button", role: "radio", "aria-checked": o.value === value }, o.label))
  ));
}
function TweakSelect({ label, value, options, onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement("select", { className: "twk-field", value, onChange: (e) => onChange(e.target.value) }, options.map((o) => {
    const v = typeof o === "object" ? o.value : o;
    const l = typeof o === "object" ? o.label : o;
    return /* @__PURE__ */ React.createElement("option", { key: v, value: v }, l);
  })));
}
function TweakText({ label, value, placeholder, onChange }) {
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "twk-field",
      type: "text",
      value,
      placeholder,
      onChange: (e) => onChange(e.target.value)
    }
  ));
}
function TweakNumber({ label, value, min, max, step = 1, unit = "", onChange }) {
  const clamp = (n) => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({ x: 0, val: 0 });
  const onScrubStart = (e) => {
    e.preventDefault();
    startRef.current = { x: e.clientX, val: value };
    const decimals = (String(step).split(".")[1] || "").length;
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return /* @__PURE__ */ React.createElement("div", { className: "twk-num" }, /* @__PURE__ */ React.createElement("span", { className: "twk-num-lbl", onPointerDown: onScrubStart }, label), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value,
      min,
      max,
      step,
      onChange: (e) => onChange(clamp(Number(e.target.value)))
    }
  ), unit && /* @__PURE__ */ React.createElement("span", { className: "twk-num-unit" }, unit));
}
function __twkIsLight(hex) {
  const h = String(hex).replace("#", "");
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, "0");
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148e3;
}
const __TwkCheck = ({ light }) => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 14 14", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(
  "path",
  {
    d: "M3 7.2 5.8 10 11 4.2",
    fill: "none",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    stroke: light ? "rgba(0,0,0,.78)" : "#fff"
  }
));
function TweakColor({ label, value, options, onChange }) {
  if (!options || !options.length) {
    return /* @__PURE__ */ React.createElement("div", { className: "twk-row twk-row-h" }, /* @__PURE__ */ React.createElement("div", { className: "twk-lbl" }, /* @__PURE__ */ React.createElement("span", null, label)), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "color",
        className: "twk-swatch",
        value,
        onChange: (e) => onChange(e.target.value)
      }
    ));
  }
  const key = (o) => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /* @__PURE__ */ React.createElement(TweakRow, { label }, /* @__PURE__ */ React.createElement("div", { className: "twk-chips", role: "radiogroup" }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        type: "button",
        className: "twk-chip",
        role: "radio",
        "aria-checked": on,
        "data-on": on ? "1" : "0",
        "aria-label": colors.join(", "),
        title: colors.join(" \xB7 "),
        style: { background: hero },
        onClick: () => onChange(o)
      },
      sup.length > 0 && /* @__PURE__ */ React.createElement("span", null, sup.map((c, j) => /* @__PURE__ */ React.createElement("i", { key: j, style: { background: c } }))),
      on && /* @__PURE__ */ React.createElement(__TwkCheck, { light: __twkIsLight(hero) })
    );
  })));
}
function TweakButton({ label, onClick, secondary = false }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: secondary ? "twk-btn secondary" : "twk-btn",
      onClick
    },
    label
  );
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
(function() {
  const s = document.createElement("style");
  s.textContent = `
    @keyframes twk-blink{50%{opacity:0}}
    @keyframes twk-fadein{from{opacity:0;transform:translateX(4px)}to{opacity:1;transform:none}}
    .twk-sugg{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:8px;
      background:rgba(0,0,0,.04);border:.5px solid rgba(0,0,0,.06);transition:all .15s}
    .twk-sugg:focus-within{background:rgba(0,0,0,.06);border-color:rgba(0,0,0,.12)}
    .twk-sugg-field{position:relative;flex:1;min-width:0}
    .twk-sugg-field input{width:100%;height:20px;border:0;background:transparent;
      font:inherit;outline:none;color:inherit}
    .twk-sugg-ghost{position:absolute;inset:0;display:flex;align-items:center;
      color:rgba(41,38,27,.42);pointer-events:none;white-space:nowrap;overflow:hidden}
    .twk-sugg-ghost.hint{color:rgba(41,38,27,.28)}
    .twk-sugg-caret{display:inline-block;width:1px;height:13px;margin-left:1px;
      border-right:1.5px solid currentColor;opacity:.5;animation:twk-blink 1s step-end infinite}
    .twk-sugg-ideas{appearance:none;border:0;background:transparent;font:inherit;
      font-size:10.5px;font-weight:600;color:rgba(41,38,27,.6);cursor:default;padding:0 2px;
      white-space:nowrap;animation:twk-fadein .25s ease}
    .twk-sugg-ideas:hover{color:rgba(41,38,27,.85)}
    .twk-sugg-ideas svg{color:#7A5AE0}
    .twk-sugg-send{appearance:none;border:0;height:20px;padding:0 8px;border-radius:5px;
      background:#29261b;color:#fff;font:inherit;font-size:10px;font-weight:600;cursor:default}
  `;
  document.head.appendChild(s);
})();
const __twkSendChat = (text) => window.parent.postMessage({ type: "__edit_mode_chat", text }, "*");
const __TWK_SPARK_STAR = "M14.8299 10.378C15.1555 10.499 15.1827 10.9337 14.8747 11.0918L11.401 12.8747C11.3125 12.9202 11.2445 12.9955 11.2099 13.0864L9.95228 16.3963C9.82177 16.7397 9.31884 16.7397 9.18834 16.3963L7.93069 13.0864C7.89616 12.9955 7.82814 12.9202 7.73965 12.8747L4.2659 11.0918C3.95787 10.9337 3.98513 10.499 4.31067 10.378L7.69556 9.11947C7.81035 9.0768 7.89899 8.98625 7.93669 8.87317L9.18301 5.13503C9.30417 4.77165 9.83645 4.77165 9.9576 5.13503L11.2039 8.87317C11.2416 8.98626 11.3303 9.0768 11.4451 9.11947L14.8299 10.378Z";
const __TWK_SPARK_DOT = "M6.0114 3.58637C6.35897 3.71564 6.35897 4.19061 6.0114 4.31988L4.98024 4.70337C4.86547 4.74605 4.77685 4.83659 4.73915 4.94965L4.33943 6.14853C4.21828 6.51191 3.686 6.51191 3.56485 6.14853L3.16513 4.94965C3.12743 4.83659 3.03881 4.74605 2.92404 4.70337L1.89288 4.31988C1.54531 4.19061 1.54531 3.71564 1.89288 3.58637L2.92404 3.20288C3.03881 3.1602 3.12743 3.06966 3.16513 2.9566L3.56485 1.75772C3.686 1.39434 4.21828 1.39434 4.33943 1.75772L4.73915 2.9566C4.77685 3.06966 4.86547 3.1602 4.98024 3.20288L6.0114 3.58637Z";
function __TwkSpark({ size = 12 }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 17 18",
      fill: "currentColor",
      style: { display: "inline-block", verticalAlign: "-1px" }
    },
    /* @__PURE__ */ React.createElement("path", { d: __TWK_SPARK_STAR }),
    /* @__PURE__ */ React.createElement("path", { d: __TWK_SPARK_DOT })
  );
}
function TweakSuggestionBar({
  suggestions = [],
  placeholder = "Describe a tweak\u2026",
  ideasPrompt = "Suggest three more tweak ideas for this design and update the suggestions on TweakSuggestionBar."
}) {
  const [val, setVal] = React.useState("");
  const [ghost, setGhost] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef(null);
  const tw = useTwkTypewriter(suggestions, { placeholder, enabled: !val && !ghost && !focused });
  const freeze = () => {
    tw.markPlayed();
    if (val || ghost) return;
    const target = !tw.done ? suggestions[tw.idx] : "";
    if (target) setGhost(target);
    inputRef.current?.focus();
  };
  const submit = () => {
    const v = (val || ghost).trim();
    if (!v) return;
    __twkSendChat(v);
    setVal("");
    setGhost("");
  };
  const onKeyDown = (e) => {
    if (e.key === "Tab" && ghost && !val) {
      e.preventDefault();
      setVal(ghost);
      setGhost("");
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setGhost("");
    }
  };
  const requestIdeas = () => __twkSendChat(ideasPrompt);
  const showAnim = !val && !ghost && !focused && !tw.done;
  const showStatic = !val && !ghost && !focused && tw.done;
  return /* @__PURE__ */ React.createElement("div", { className: "twk-sugg", onMouseDown: freeze }, /* @__PURE__ */ React.createElement("div", { className: "twk-sugg-field" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      ref: inputRef,
      value: val,
      placeholder: focused && !ghost ? placeholder : "",
      onChange: (e) => {
        setVal(e.target.value);
        setGhost("");
      },
      onFocus: () => {
        setFocused(true);
        tw.markPlayed();
      },
      onBlur: () => {
        setFocused(false);
        if (!val) setGhost("");
      },
      onKeyDown
    }
  ), showAnim && /* @__PURE__ */ React.createElement("div", { className: "twk-sugg-ghost" }, tw.text, /* @__PURE__ */ React.createElement("span", { className: "twk-sugg-caret" })), showStatic && /* @__PURE__ */ React.createElement("div", { className: "twk-sugg-ghost" }, tw.tail, tw.tail.length < placeholder.length && /* @__PURE__ */ React.createElement("span", { className: "twk-sugg-caret" })), ghost && !val && /* @__PURE__ */ React.createElement("div", { className: "twk-sugg-ghost hint" }, ghost)), val || ghost ? /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "twk-sugg-send",
      onMouseDown: (e) => {
        e.stopPropagation();
        e.preventDefault();
      },
      onClick: submit
    },
    "Add"
  ) : tw.done && !focused ? /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "twk-sugg-ideas",
      onMouseDown: (e) => {
        e.stopPropagation();
        e.preventDefault();
      },
      onClick: requestIdeas
    },
    "Ideas ",
    /* @__PURE__ */ React.createElement(__TwkSpark, null)
  ) : null);
}
function useTwkTypewriter(items, { placeholder, typeMs = 35, eraseMs = 22, pauseMs = 1800, enabled = true } = {}) {
  const key = React.useMemo(() => "__twk_played:" + JSON.stringify(items), [JSON.stringify(items)]);
  const played = () => {
    try {
      return sessionStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  };
  const [text, setText] = React.useState("");
  const [tail, setTail] = React.useState(() => items.length === 0 || played() ? placeholder : "");
  const [idx, setIdx] = React.useState(0);
  const [done, setDone] = React.useState(() => items.length === 0 || played());
  const phase = React.useRef("type");
  const n = React.useRef(0);
  const markPlayed = React.useCallback(() => {
    try {
      sessionStorage.setItem(key, "1");
    } catch {
    }
    setDone(true);
  }, [key]);
  React.useEffect(() => {
    const skip = items.length === 0 || played();
    setText("");
    setIdx(0);
    setDone(skip);
    setTail(skip ? placeholder : "");
    phase.current = "type";
    n.current = 0;
  }, [key]);
  React.useEffect(() => {
    if (done || !enabled) return;
    const item = items[idx] ?? "";
    let t;
    const tick = () => {
      if (phase.current === "type") {
        n.current++;
        setText(item.slice(0, n.current));
        if (n.current >= item.length) {
          phase.current = "pause";
          t = setTimeout(tick, pauseMs);
        } else t = setTimeout(tick, typeMs + Math.random() * 20);
      } else if (phase.current === "pause") {
        phase.current = "erase";
        t = setTimeout(tick, eraseMs);
      } else {
        n.current--;
        setText(item.slice(0, n.current));
        if (n.current <= 0) {
          if (idx === items.length - 1) {
            markPlayed();
            return;
          }
          phase.current = "type";
          setIdx((i) => i + 1);
        } else t = setTimeout(tick, eraseMs);
      }
    };
    phase.current = "type";
    n.current = 0;
    setText("");
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [idx, done, key, enabled, typeMs, eraseMs, pauseMs]);
  React.useEffect(() => {
    if (!done || tail === placeholder) return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTail(placeholder.slice(0, i));
      if (i >= placeholder.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [done, placeholder]);
  return { text, tail, idx, done, markPlayed };
}
Object.assign(window, { TweakSuggestionBar });
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } = React;
const nf = new Intl.NumberFormat("ru-RU");
function money(n, cur) {
  return nf.format(Math.round(n)) + (cur === false ? "" : "");
}
function summ(n) {
  return nf.format(Math.round(n));
}
function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
const ICON_PATHS = {
  receipt: "M5 3v14l2-1.2L9 17l2-1.2L13 17l2-1.2L17 17V3l-2 1.2L13 3l-2 1.2L9 3 7 4.2 5 3Z M8 7h6 M8 10.5h6",
  book: "M4 4.5A1.5 1.5 0 0 1 5.5 3H16v14H5.5A1.5 1.5 0 0 0 4 18.5V4.5Z M4 18.5A1.5 1.5 0 0 0 5.5 20H16v-3",
  bookStack: "M3 6h13 M3 11h13 M3 16h9",
  star: "M10 2.6l2.3 4.9 5.2.7-3.8 3.7.9 5.3-4.6-2.5-4.6 2.5.9-5.3L2.5 8.2l5.2-.7L10 2.6Z",
  grid: "M3 3h6v6H3z M11 3h6v6h-6z M3 11h6v6H3z M11 11h6v6h-6z",
  bike: "M6 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M14 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M6 13l3.5-5.5H13 M9.5 7.5 12 13 M13 5h3",
  menuBook: "M3 4h6a3 3 0 0 1 3 3v10a2.2 2.2 0 0 0-2.2-2.2H3V4Z M17 4h-3a3 3 0 0 0-3 3v10a2.2 2.2 0 0 1 2.2-2.2H17V4Z",
  users: "M13 17v-1.5a3.5 3.5 0 0 0-3.5-3.5h-4A3.5 3.5 0 0 0 2 15.5V17 M7.5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M18 17v-1.5a3.5 3.5 0 0 0-2.6-3.4 M13.5 3.3a3 3 0 0 1 0 5.4",
  chart: "M3 17h14 M5.5 17V9 M9.5 17V5 M13.5 17v-4",
  gear: "M10 12.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z M16.3 12a6.3 6.3 0 0 0 0-4l1.5-1-1.6-2.8-1.9.7a6.3 6.3 0 0 0-3.4-2l-.4-2H8.4l-.4 2a6.3 6.3 0 0 0-3.4 2l-1.9-.7L1.1 7l1.5 1a6.3 6.3 0 0 0 0 4l-1.5 1 1.6 2.8 1.9-.7a6.3 6.3 0 0 0 3.4 2l.4 2h4.2l.4-2a6.3 6.3 0 0 0 3.4-2l1.9.7 1.6-2.8-1.6-1Z",
  search: "M9 15.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z M14 14l4 4",
  clock: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M10 6v4.3l2.8 1.7",
  bell: "M10 2.5a4.5 4.5 0 0 0-4.5 4.5c0 4-1.5 5-1.5 5h12s-1.5-1-1.5-5A4.5 4.5 0 0 0 10 2.5Z M8.2 15a1.9 1.9 0 0 0 3.6 0",
  pie: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M10 2v8h8",
  dpad: "M6.5 8.5h7a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v0a3 3 0 0 1 3-3Z M7 10.4v2.2 M5.9 11.5h2.2 M12.4 11v.01 M13.9 12.5v.01",
  printer: "M6 8V3h8v5 M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-4A1.5 1.5 0 0 1 4.5 8h11A1.5 1.5 0 0 1 17 9.5v4a1.5 1.5 0 0 1-1.5 1.5H14 M6 12h8v5H6z",
  phone: "M4 3.5h3l1.5 3.7-1.9 1.4a10 10 0 0 0 4.8 4.8l1.4-1.9L16.5 13v3.5a1.5 1.5 0 0 1-1.7 1.5A13.5 13.5 0 0 1 2.5 5.2 1.5 1.5 0 0 1 4 3.5Z",
  check: "M4 10.5 7.5 14 16 5.5",
  x: "M5 5l10 10 M15 5 5 15",
  chevronR: "M7.5 4.5 13 10l-5.5 5.5",
  chevronD: "M5 7.5 10 13l5-5.5",
  chevronU: "M5 12.5 10 7l5 5.5",
  chevronL: "M12.5 4.5 7 10l5.5 5.5",
  arrowUp: "M10 16V4 M5 9l5-5 5 5",
  arrowDown: "M10 4v12 M5 11l5 5 5-5",
  arrowRight: "M4 10h12 M11 5l5 5-5 5",
  pin: "M10 17s5.5-5 5.5-9a5.5 5.5 0 1 0-11 0c0 4 5.5 9 5.5 9Z M10 9.7a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z",
  wallet: "M3 6.5A2.5 2.5 0 0 1 5.5 4H15v3 M3 6.5V15a2 2 0 0 0 2 2h11a1 1 0 0 0 1-1V7H4a1 1 0 0 0-1 1Z M14 11.5h.01",
  card: "M2.5 6.5h15v8a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-8Z M2.5 9h15 M5 13h3",
  bank: "M2.5 8 10 4l7.5 4 M4 8v7 M8 8v7 M12 8v7 M16 8v7 M2.5 17.5h15",
  alert: "M10 3.2 18 16.5H2L10 3.2Z M10 8v3.5 M10 13.8v.01",
  box: "M3 6.5h14v10H3z M3 9.5h14 M7 6.5v-3h6v3",
  truck: "M2.5 5.5h9v8h-9z M11.5 8h3l3 3v2.5h-6 M6 16.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z M14.5 16.5a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z",
  loop: "M15.5 8A6 6 0 0 0 4.6 6.2 M4.5 12A6 6 0 0 0 15.4 13.8 M15.5 4v4h-4 M4.5 16v-4h4",
  sliders: "M3 6h9 M15 6h2 M3 14h3 M9 14h8 M13.5 6a1.5 1.5 0 1 0 0-.01 M7.5 14a1.5 1.5 0 1 0 0-.01",
  layers: "M10 2.5 17 6.5l-7 4-7-4 7-4Z M3 10.5l7 4 7-4 M3 14.5l7 4 7-4",
  palette: "M10 17.5a7.5 7.5 0 1 1 0-15c4.4 0 7.5 3 7.5 6.5 0 2-1.5 3-3 3h-1.6a1.6 1.6 0 0 0-1.1 2.7c.5.6.2 1.8-1.3 1.8Z M6.5 9.5v.01 M9 6.8v.01 M13 6.8v.01",
  globe: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M2.5 10h15 M10 2c2 2.4 3 4.9 3 8s-1 5.6-3 8c-2-2.4-3-4.9-3-8s1-5.6 3-8Z",
  plus: "M10 4v12 M4 10h12",
  minus: "M4 10h12",
  filter: "M3 5h14 M6 10h8 M8.5 15h3",
  more: "M4 10h.01 M10 10h.01 M16 10h.01",
  edit: "M4 16v-3.2L14.2 2.6l3.2 3.2L7.2 16H4Z M12.6 4.2l3.2 3.2",
  trash: "M3.5 5.5h13 M8 5.5V3.2h4V5.5 M5.5 5.5l.8 10.3a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9l.8-10.3",
  door: "M4.5 17.5V3.5h11v14 M2.5 17.5h15 M12 10.5v.01",
  lock: "M4.5 9V6.5a3 3 0 0 1 6 0V9 M3.5 9h8v7h-8z",
  eye: "M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z M10 12.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  flame: "M10 17.5c3 0 5-1.9 5-4.6 0-3.4-3.2-5-4.3-8.4-1.6 1.4-1.7 3.4-1.2 5-1-.4-1.8-1.4-2-2.6-1 1.3-2.5 3.4-2.5 6 0 2.7 2 4.6 5 4.6Z",
  wifi: "M2.5 7.5a11 11 0 0 1 15 0 M5.5 10.5a7 7 0 0 1 9 0 M8.4 13.4a3 3 0 0 1 3.2 0 M10 16.5v.01",
  terminal: "M3 4.5h14v11H3z M6.5 8l2 2-2 2 M10.5 12.5h3",
  calendar: "M3.5 5.5h13v11h-13z M3.5 9h13 M7 3v3 M13 3v3",
  copy: "M7 7h9v9H7z M4 12.5V4h8.5",
  download: "M10 3v9 M6 8.5l4 4 4-4 M3.5 16.5h13",
  bolt: "M11.5 2.5 4.5 11.5h4L8 17.5l7-9h-4l.5-6Z",
  panel: "M3 4.5h14v11H3z M8 4.5v11",
  status: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M10 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
  eyeOff: "M2 2l16 16 M8.4 8.5a2.6 2.6 0 0 0 3.1 3.1 M5.1 5.3C3.5 6.6 2 10 2 10s3 5.5 8 5.5c1.9 0 3.6-.6 5-1.6 M11.8 4.7C17 5.2 18.5 10 18.5 10s-1 1.9-2.5 3.3",
  logOut: "M7 17.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 4.5 2.5H7 M12.5 14l4-4-4-4 M16.5 10H7",
  music: "M9 18V5l8-2v13 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M17 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  hamburger: "M3 5.5h14 M3 10h14 M3 14.5h14"
};
function Icon({ name, size = 16, stroke = 1.6, style, className }) {
  const d = ICON_PATHS[name] || ICON_PATHS.box;
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 20 20",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: stroke,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style,
      className,
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React.createElement("path", { d })
  );
}
function Btn({ variant, size, icon, children, className = "", ...rest }) {
  const cls = ["btn", variant ? "btn-" + variant : "", size ? "btn-" + size : "", className].filter(Boolean).join(" ");
  return /* @__PURE__ */ React.createElement("button", { className: cls, ...rest }, icon && /* @__PURE__ */ React.createElement(Icon, { name: icon, size: size === "sm" ? 13 : 14 }), children);
}
const PILL_TONES = ["ok", "warn", "danger", "info", "violet", "muted", "accent"];
function Pill({ tone = "muted", dot, children, style }) {
  return /* @__PURE__ */ React.createElement("span", { className: "pill", "data-tone": tone, style }, dot && /* @__PURE__ */ React.createElement("i", null), children);
}
const TYPE_META = {
  delivery: { icon: "bike", tone: "info", ru: "\u041A\u0443\u0440\u044C\u0435\u0440\u0441\u043A\u0430\u044F \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430" },
  pickup: { icon: "box", tone: "warn", ru: "\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437 \u0438\u0437 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0430" },
  hall: { icon: "door", tone: "violet", ru: "\u0412 \u0437\u0430\u043B\u0435" }
};
function TypeTag({ type, t }) {
  const m = TYPE_META[type] || TYPE_META.delivery;
  return /* @__PURE__ */ React.createElement("span", { className: "pill", "data-tone": m.tone, style: { paddingLeft: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: m.icon, size: 11, stroke: 1.7 }), t(type));
}
function slaState(o) {
  const pct = o.elapsed / o.sla;
  const left = o.sla - o.elapsed;
  return {
    pct,
    left,
    late: left <= 0,
    warn: left > 0 && left <= 5,
    tone: left <= 0 ? "danger" : pct > 0.72 ? "warn" : "ok"
  };
}
function fmtElapsed(min) {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return m + "\u043C";
  const h = Math.floor(m / 60);
  return h + "\u0447 " + m % 60 + "\u043C";
}
function SlaBar({ o }) {
  const s = slaState(o);
  const w = Math.min(100, Math.round(s.pct * 100));
  return /* @__PURE__ */ React.createElement("div", { className: "sla-bar" }, /* @__PURE__ */ React.createElement("div", { className: "sla-fill", "data-tone": s.tone, style: { width: Math.max(3, w) + "%" } }));
}
function SlaTime({ o, t }) {
  const s = slaState(o);
  return /* @__PURE__ */ React.createElement("span", { className: "otime", "data-late": s.late ? "1" : "0", "data-warn": s.warn ? "1" : "0" }, /* @__PURE__ */ React.createElement(Icon, { name: s.late ? "alert" : "clock", size: 10, stroke: 1.9 }), s.late ? `${t("late")} ${fmtElapsed(-s.left)}` : `${fmtElapsed(s.left)}`);
}
function Spark({ data, w = 96, h = 40, color, fill = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [i / (data.length - 1) * w, h - 3 - (v - min) / rng * (h - 8)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const gid = "sg" + Math.random().toString(36).slice(2, 8);
  return /* @__PURE__ */ React.createElement("svg", { width: w, height: h, viewBox: `0 0 ${w} ${h}`, style: { display: "block" } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: color || "var(--accent)", stopOpacity: ".28" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: color || "var(--accent)", stopOpacity: "0" }))), fill && /* @__PURE__ */ React.createElement("path", { d: area, fill: `url(#${gid})` }), /* @__PURE__ */ React.createElement("path", { d: line, fill: "none", stroke: color || "var(--accent)", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("circle", { cx: pts[pts.length - 1][0] - 1, cy: pts[pts.length - 1][1], r: "2", fill: color || "var(--accent)" }));
}
function Bars({ data, labels, height = 130, color }) {
  const max = Math.max(...data);
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 6, height, padding: "0 2px" } }, data.map((v, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, width: "100%", display: "flex", alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "100%",
    height: Math.max(4, v / max * 100) + "%",
    background: color || "var(--accent)",
    opacity: 0.35 + 0.65 * (v / max),
    borderRadius: "3px 3px 1px 1px",
    transition: "height .4s var(--ease)"
  }, title: String(v) })), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8.5, color: "var(--text-3)", whiteSpace: "nowrap" } }, labels ? labels[i] : ""))));
}
function LineChart({ series, labels, height = 150 }) {
  const w = 640, h = height, padL = 30, padB = 20, padT = 8;
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all) * 1.12;
  const iw = w - padL, ih = h - padB - padT;
  const px = (i, n) => padL + i / (n - 1) * iw;
  const py = (v) => padT + ih - v / max * ih;
  return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", style: { width: "100%", height, display: "block", overflow: "visible" } }, [0, 0.25, 0.5, 0.75, 1].map((g, i) => /* @__PURE__ */ React.createElement(
    "line",
    {
      key: i,
      x1: padL,
      x2: w,
      y1: padT + ih * g,
      y2: padT + ih * g,
      stroke: "var(--line-soft)",
      strokeWidth: "1",
      vectorEffect: "non-scaling-stroke"
    }
  )), series.map((s, si) => {
    const pts = s.data.map((v, i) => [px(i, s.data.length), py(v)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    return /* @__PURE__ */ React.createElement("g", { key: si }, s.fill && /* @__PURE__ */ React.createElement(
      "path",
      {
        d: line + ` L${px(s.data.length - 1, s.data.length)} ${padT + ih} L${padL} ${padT + ih} Z`,
        fill: s.color,
        opacity: ".1"
      }
    ), /* @__PURE__ */ React.createElement(
      "path",
      {
        d: line,
        fill: "none",
        stroke: s.color,
        strokeWidth: "1.8",
        strokeLinejoin: "round",
        strokeLinecap: "round",
        strokeDasharray: s.dash ? "4 4" : "none",
        vectorEffect: "non-scaling-stroke"
      }
    ), s.data.map((v, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: px(i, s.data.length), cy: py(v), r: "2.4", fill: s.color })));
  }), labels.map((l, i) => /* @__PURE__ */ React.createElement(
    "text",
    {
      key: i,
      x: px(i, labels.length),
      y: h - 4,
      fill: "var(--text-3)",
      fontSize: "9",
      textAnchor: "middle",
      fontFamily: "var(--f-mono)"
    },
    l
  )));
}
function useTick(ms = 1e3) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
function Modal({ children, onClose, width = 460, drawer = false, className = "", label }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return /* @__PURE__ */ React.createElement("div", { className: "scrim" + (drawer ? " drawer-scrim" : ""), onMouseDown: (e) => {
    if (e.target === e.currentTarget) onClose && onClose();
  } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "modal" + (drawer ? " drawer" : "") + " " + className,
      role: "dialog",
      "aria-label": label,
      "data-screen-label": label,
      style: drawer ? void 0 : { width, maxWidth: "100%" }
    },
    children
  ));
}
function useToasts() {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, tone = "ok", icon) => {
    const id = Math.random().toString(36).slice(2);
    setItems((s) => [...s, { id, msg, tone, icon }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2600);
  }, []);
  return [items, push];
}
function Toasts({ items }) {
  return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 300, display: "flex", flexDirection: "column", gap: 7, alignItems: "center", pointerEvents: "none" } }, items.map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, style: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 13px",
    borderRadius: "var(--r-sm)",
    background: "var(--surface-hi)",
    border: "1px solid var(--line-strong)",
    color: "var(--text)",
    fontSize: 11.5,
    fontWeight: 600,
    boxShadow: "var(--shadow-pop)",
    animation: "rise .2s var(--ease)"
  } }, /* @__PURE__ */ React.createElement("span", { style: { color: t.tone === "danger" ? "var(--danger)" : t.tone === "warn" ? "var(--warn)" : "var(--ok)", display: "flex" } }, /* @__PURE__ */ React.createElement(Icon, { name: t.icon || (t.tone === "danger" ? "alert" : "check"), size: 14, stroke: 2 })), t.msg)));
}
let audioCtx = null;
function beep(kind = "alert") {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = audioCtx.currentTime;
    const tones = kind === "danger" ? [740, 560] : [560, 740];
    tones.forEach((f, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, t0 + i * 0.13);
      gain.gain.linearRampToValueAtTime(0.05, t0 + i * 0.13 + 0.015);
      gain.gain.exponentialRampToValueAtTime(1e-4, t0 + i * 0.13 + 0.11);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t0 + i * 0.13);
      osc.stop(t0 + i * 0.13 + 0.12);
    });
  } catch (e) {
  }
}
Object.assign(window, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
  nf,
  money,
  summ,
  initials,
  Icon,
  Btn,
  Pill,
  PILL_TONES,
  TYPE_META,
  TypeTag,
  slaState,
  fmtElapsed,
  SlaBar,
  SlaTime,
  Spark,
  Bars,
  LineChart,
  useTick,
  Modal,
  useToasts,
  Toasts,
  beep
});
const NAV = [
  { group: "grp_ops", items: [
    { id: "dispatch", icon: "dpad", k: "dispatch", badge: "live" },
    { id: "bookings", icon: "calendar", k: "bookings", badge: 4 },
    { id: "banquets", icon: "star", k: "banquets" }
  ] },
  { group: "grp_venue", items: [
    { id: "floor", icon: "grid", k: "floor" },
    { id: "couriers", icon: "bike", k: "couriers", badge: 3 }
  ] },
  { group: "grp_admin", items: [
    { id: "menu", icon: "menuBook", k: "menu" },
    { id: "staff", icon: "users", k: "staff" },
    { id: "analytics", icon: "chart", k: "analytics" },
    { id: "settings", icon: "gear", k: "settings" }
  ] }
];
const PAGE_META = {
  dispatch: { eyebrow: "FENIX \xB7 OPS", icon: "dpad" },
  bookings: { eyebrow: "FENIX \xB7 OPS", icon: "calendar" },
  banquets: { eyebrow: "FENIX \xB7 OPS", icon: "star" },
  floor: { eyebrow: "FENIX \xB7 VENUE", icon: "grid" },
  couriers: { eyebrow: "FENIX \xB7 VENUE", icon: "bike" },
  menu: { eyebrow: "FENIX \xB7 ADMIN", icon: "menuBook" },
  staff: { eyebrow: "FENIX \xB7 ADMIN", icon: "users" },
  analytics: { eyebrow: "FENIX \xB7 ADMIN", icon: "chart" },
  settings: { eyebrow: "FENIX \xB7 ADMIN", icon: "gear" }
};
function Sidebar({ page, setPage, rail, t, counts, onLogout, mobileOpen, onCloseMobile, user, onSwitchUser }) {
  const displayName = user?.name || user?.full_name || "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 Fenix";
  const displayRole = user?.role || "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440";
  const displayInitials = user?.initials || initials(displayName);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, mobileOpen && /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "mobile-drawer-scrim",
      onClick: onCloseMobile,
      "aria-hidden": "true"
    }
  ), /* @__PURE__ */ React.createElement("nav", { className: `nav ${mobileOpen ? "mobile-open" : ""}`, "aria-label": "Main" }, /* @__PURE__ */ React.createElement("div", { className: "nav-brand" }, /* @__PURE__ */ React.createElement("div", { className: "brand-mark" }, /* @__PURE__ */ React.createElement(Icon, { name: "layers", size: 17, stroke: 1.7 })), /* @__PURE__ */ React.createElement("div", { className: "brand-txt" }, /* @__PURE__ */ React.createElement("div", { className: "brand-name" }, "Fenix"), /* @__PURE__ */ React.createElement("div", { className: "brand-sub" }, "Terminal & Dispatch OS")), mobileOpen && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-ghost btn-icon btn-sm",
      onClick: onCloseMobile,
      style: { marginLeft: "auto" },
      title: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 16 })
  )), /* @__PURE__ */ React.createElement("div", { className: "nav-scroll" }, NAV.map((g) => /* @__PURE__ */ React.createElement("div", { className: "nav-group", key: g.group }, /* @__PURE__ */ React.createElement("div", { className: "nav-group-label" }, t(g.group)), g.items.map((it) => {
    const on = page === it.id;
    const b = it.badge === "live" ? counts.live : it.badge;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: it.id,
        className: "nav-item",
        "data-on": on ? "1" : "0",
        onClick: () => {
          setPage(it.id);
          if (onCloseMobile) onCloseMobile();
        },
        title: rail ? t(it.k) : void 0
      },
      /* @__PURE__ */ React.createElement(Icon, { name: it.icon, size: 16 }),
      /* @__PURE__ */ React.createElement("span", { className: "nav-item-txt" }, t(it.k)),
      b != null && /* @__PURE__ */ React.createElement("span", { className: "nav-badge", "data-tone": it.badge === "live" ? "accent" : "muted" }, b),
      rail && b != null && /* @__PURE__ */ React.createElement("span", { className: "nav-dot" })
    );
  })))), /* @__PURE__ */ React.createElement("div", { className: "nav-foot", style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "nav-user",
      style: { flex: 1, cursor: "pointer", textAlign: "left", border: "none", background: "transparent" },
      onClick: onSwitchUser,
      title: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u0441\u043C\u0435\u043D\u044B \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u0430 \u0441\u043C\u0435\u043D\u044B"
    },
    /* @__PURE__ */ React.createElement("span", { className: "avatar", "data-tone": "accent" }, displayInitials),
    /* @__PURE__ */ React.createElement("span", { className: "nav-user-txt" }, /* @__PURE__ */ React.createElement("span", { className: "nav-user-name" }, displayName), /* @__PURE__ */ React.createElement("span", { className: "nav-user-role" }, displayRole, " \xB7 \u041D\u0430 \u0441\u043C\u0435\u043D\u0435"))
  ), onLogout && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "btn btn-ghost btn-icon btn-sm",
      onClick: onLogout,
      title: "\u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u044B",
      style: { color: "var(--text-3)", padding: "8px", cursor: "pointer" },
      onMouseOver: (e) => e.currentTarget.style.color = "var(--danger)",
      onMouseOut: (e) => e.currentTarget.style.color = "var(--text-3)"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "logOut", size: 16 })
  ))));
}
function Topbar({ page, t, rail, setRail, now, onSearch, theme, setTheme, lang, setLang, onNew, toast, onLogout, onToggleMenu }) {
  const hh = new Date(now);
  const clock = [hh.getHours(), hh.getMinutes(), hh.getSeconds()].map((x) => String(x).padStart(2, "0")).join(":");
  const meta = PAGE_META[page] || {};
  return /* @__PURE__ */ React.createElement("header", { className: "topbar" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-icon mobile-menu-btn", onClick: onToggleMenu, title: "\u041C\u0435\u043D\u044E \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0438" }, /* @__PURE__ */ React.createElement(Icon, { name: "hamburger", size: 17 })), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-icon desktop-rail-btn", onClick: () => setRail(!rail), title: "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043F\u0430\u043D\u0435\u043B\u044C" }, /* @__PURE__ */ React.createElement(Icon, { name: "panel", size: 16 })), /* @__PURE__ */ React.createElement("div", { className: "topbar-page" }, /* @__PURE__ */ React.createElement("div", { className: "topbar-eyebrow" }, meta.eyebrow), /* @__PURE__ */ React.createElement("h1", { className: "topbar-title", "data-screen-label": t(page) }, t(page))), /* @__PURE__ */ React.createElement("div", { className: "topbar-mid" }, /* @__PURE__ */ React.createElement("span", { className: "live" }, /* @__PURE__ */ React.createElement("i", null), t("live")), /* @__PURE__ */ React.createElement("span", { className: "clock" }, /* @__PURE__ */ React.createElement(Icon, { name: "clock", size: 13 }), t("shift"), ": ", /* @__PURE__ */ React.createElement("b", null, clock))), /* @__PURE__ */ React.createElement("div", { className: "topbar-right" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-sm", onClick: onSearch, title: t("search_short"), style: { gap: 6 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14 }), /* @__PURE__ */ React.createElement("span", { className: "kbd hide-mobile" }, "\u2318K")), /* @__PURE__ */ React.createElement("div", { className: "seg hide-mobile", role: "group", "aria-label": t("theme") }, THEMES.map((th) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: th.id,
      "data-on": theme === th.id ? "1" : "0",
      onClick: () => setTheme(th.id),
      title: th.label,
      style: { padding: "0 7px" }
    },
    /* @__PURE__ */ React.createElement("span", { style: {
      width: 9,
      height: 9,
      borderRadius: 2,
      display: "block",
      background: th.swatch,
      boxShadow: "0 0 0 1px var(--line)"
    } })
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-ghost btn-sm hide-mobile",
      onClick: () => setLang(lang === "ru" ? "uz" : lang === "uz" ? "uzc" : "ru"),
      title: t("language"),
      style: { fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: ".04em", padding: "0 6px" }
    },
    lang === "ru" ? "RU" : lang === "uz" ? "UZ" : "\u040E\u0417"
  ), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-icon btn-sm", title: t("attention"), onClick: () => toast("6 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F", "warn", "alert") }, /* @__PURE__ */ React.createElement(Icon, { name: "bell", size: 15 })), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "plus", onClick: onNew }, t("create")), onLogout && /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-icon btn-sm hide-mobile", title: "\u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u044B", onClick: onLogout, style: { color: "var(--text-3)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "logOut", size: 15 }))));
}
function MobileBottomNav({ page, setPage, counts, onOpenDrawer }) {
  const PRIMARY_TABS = [
    { id: "dispatch", label: "\u0417\u0430\u043A\u0430\u0437\u044B", icon: "dpad", badge: counts.live },
    { id: "bookings", label: "\u0411\u0440\u043E\u043D\u0438", icon: "calendar", badge: 4 },
    { id: "floor", label: "\u0417\u0430\u043B", icon: "grid" },
    { id: "couriers", label: "\u041A\u0443\u0440\u044C\u0435\u0440\u044B", icon: "bike", badge: 3 },
    { id: "menu", label: "\u041C\u0435\u043D\u044E", icon: "menuBook" }
  ];
  return /* @__PURE__ */ React.createElement("nav", { className: "mobile-bottom-nav", "aria-label": "\u041C\u043E\u0431\u0438\u043B\u044C\u043D\u0430\u044F \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F" }, PRIMARY_TABS.map((tab) => {
    const on = page === tab.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tab.id,
        className: "mobile-tab-btn",
        "data-on": on ? "1" : "0",
        onClick: () => setPage(tab.id)
      },
      /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: tab.icon, size: 18 }), tab.badge != null && tab.badge > 0 && /* @__PURE__ */ React.createElement("span", { className: "mobile-tab-badge" }, tab.badge)),
      /* @__PURE__ */ React.createElement("span", { className: "mobile-tab-label" }, tab.label)
    );
  }), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "mobile-tab-btn",
      onClick: onOpenDrawer,
      title: "\u0415\u0449\u0451 \u0440\u0430\u0437\u0434\u0435\u043B\u044B"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "more", size: 18 }),
    /* @__PURE__ */ React.createElement("span", { className: "mobile-tab-label" }, "\u0415\u0449\u0451")
  ));
}
function CommandPalette({ t, onClose, go }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);
  const cmds = [
    ...NAV.flatMap((g) => g.items.map((i) => ({ group: t(g.group), label: t(i.k), icon: i.icon, run: () => go(i.id) }))),
    { group: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F", label: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0435 \u043D\u043E\u0432\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u044B", icon: "check", run: () => {
      go("dispatch");
      onClose();
    } },
    { group: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F", label: "\u041D\u0430\u0439\u0442\u0438 \u0437\u0430\u043A\u0430\u0437 #WEB-3307", icon: "search", run: () => go("dispatch") },
    { group: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F", label: "\u0420\u0430\u0441\u043F\u0435\u0447\u0430\u0442\u0430\u0442\u044C \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0447\u0435\u043A", icon: "printer", run: () => go("dispatch") }
  ];
  const filtered = cmds.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  const groups = [...new Set(filtered.map((c) => c.group))];
  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(filtered.length - 1, i + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(0, i - 1));
    }
    if (e.key === "Enter" && filtered[idx]) {
      filtered[idx].run();
      onClose();
    }
  };
  return /* @__PURE__ */ React.createElement(Modal, { onClose, width: 520, className: "cmdk-scrim modal cmdk", label: "\u041A\u043E\u043C\u0430\u043D\u0434\u043D\u0430\u044F \u043F\u0430\u043B\u0438\u0442\u0440\u0430" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, padding: "13px 15px", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 15 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      autoFocus: true,
      value: q,
      onChange: (e) => {
        setQ(e.target.value);
        setIdx(0);
      },
      onKeyDown: onKey,
      placeholder: t("cmdk_ph"),
      style: { flex: 1, background: "none", border: 0, outline: "none", fontSize: 13.5 }
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "kbd" }, "Esc")), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { padding: 9, maxHeight: 330 } }, groups.map((g) => /* @__PURE__ */ React.createElement("div", { key: g }, /* @__PURE__ */ React.createElement("div", { className: "cmdk-group" }, g), filtered.filter((c) => c.group === g).map((c) => {
    const gi = filtered.indexOf(c);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: c.label,
        className: "cmdk-row",
        "data-on": gi === idx ? "1" : "0",
        onMouseEnter: () => setIdx(gi),
        onClick: () => {
          c.run();
          onClose();
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: c.icon, size: 14 }),
      /* @__PURE__ */ React.createElement("span", null, c.label),
      gi === idx && /* @__PURE__ */ React.createElement("span", { className: "cmdk-row-hint" }, "\u21B5")
    );
  }))), !filtered.length && /* @__PURE__ */ React.createElement("div", { className: "empty" }, "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E")), /* @__PURE__ */ React.createElement("div", { className: "modal-foot", style: { fontSize: 10, color: "var(--text-3)" } }, /* @__PURE__ */ React.createElement("span", { className: "kbd" }, "\u2191\u2193"), " \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F ", /* @__PURE__ */ React.createElement("span", { className: "kbd" }, "\u21B5"), " ", t("cmdk_hint")));
}
const THEMES = [
  { id: "gold", label: "\u0422\u0451\u043C\u043D\u043E\u0435 \u0437\u043E\u043B\u043E\u0442\u043E", swatch: "#d3aa63" },
  { id: "graphite", label: "\u0413\u0440\u0430\u0444\u0438\u0442", swatch: "#78a6dc" },
  { id: "oxblood", label: "\u041E\u043A\u0441\u0431\u043B\u0430\u0434", swatch: "#dd9a72" },
  { id: "cream", label: "\u041A\u0440\u0435\u043C (\u0434\u0435\u043D\u044C)", swatch: "#9a6f1e" }
];
const DIRECTIONS = [
  { id: "a", label: "\u0421\u043C\u043E\u043B\u0430 \xB7 luxury", note: "\u0421\u0435\u0440\u0438\u0444\u043D\u044B\u0435 \u0446\u0438\u0444\u0440\u044B, \u0442\u043E\u043D\u043A\u0438\u0435 \u0440\u0430\u043C\u043A\u0438, \u043C\u043D\u043E\u0433\u043E \u0432\u043E\u0437\u0434\u0443\u0445\u0430" },
  { id: "b", label: "\u041C\u0435\u0434\u044C \xB7 hospitality", note: "\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0433\u0440\u043E\u0442\u0435\u0441\u043A, \u0441\u043A\u0440\u0443\u0433\u043B\u0435\u043D\u0438\u044F, \u043C\u044F\u0433\u043A\u0438\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438" },
  { id: "c", label: "\u041A\u043E\u043D\u0441\u043E\u043B\u044C \xB7 ops", note: "\u041C\u043E\u043D\u043E, \u0436\u0451\u0441\u0442\u043A\u0438\u0435 \u0443\u0433\u043B\u044B, \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438" }
];
function CreateModal({ t, onClose, onCreatedOrder, onCreatedBooking, toast }) {
  const [tab, setTab] = useState("order");
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [address, setAddress] = useState("");
  const [table, setTable] = useState("\u0421\u0442\u043E\u043B 1 \xB7 \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B");
  const [itemsNote, setItemsNote] = useState("");
  const [pay, setPay] = useState("card");
  const [total, setTotal] = useState(15e4);
  const [bDate, setBDate] = useState("today");
  const [bTime, setBTime] = useState("19:00");
  const [bGuests, setBGuests] = useState(4);
  const [bZone, setBZone] = useState("\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B");
  const submitOrder = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u0430", "warn");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      toast("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430", "warn");
      return;
    }
    setLoading(true);
    try {
      const itemsMap = {};
      if (itemsNote.trim()) {
        itemsNote.split(",").forEach((it) => {
          const trimmed = it.trim();
          if (trimmed) itemsMap[trimmed] = 1;
        });
      } else {
        itemsMap["\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 \u0448\u0435\u0444\u0430"] = 1;
      }
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        orderType: orderType === "delivery" ? "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u043C (\u0441\u0430\u0439\u0442)" : orderType === "pickup" ? "\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437 (\u0441\u0430\u0439\u0442)" : "\u0417\u0430\u043A\u0430\u0437 \u0432 \u0437\u0430\u043B\u0435",
        address: orderType === "delivery" ? address || "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" : orderType === "hall" ? table : "\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437 \u0438\u0437 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0430",
        paymentMethod: pay === "card" ? "\u041E\u043D\u043B\u0430\u0439\u043D / \u041A\u0430\u0440\u0442\u0430" : "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435",
        items: itemsMap,
        total: Number(total) || 15e4,
        comment: "\u0421\u043E\u0437\u0434\u0430\u043D\u043E \u0438\u0437 FENIX Terminal"
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.ok) {
        toast(`\u0417\u0430\u043A\u0430\u0437 #${data.id || "WEB-" + data.orderNum} \u0441\u043E\u0437\u0434\u0430\u043D!`, "ok", "check");
        if (onCreatedOrder) onCreatedOrder(data, payload);
        onClose();
      } else {
        toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u0430: " + (data.error || "\u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430"), "danger");
      }
    } catch (err) {
      toast("\u0421\u0435\u0442\u0435\u0432\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438", "danger");
    } finally {
      setLoading(false);
    }
  };
  const submitBooking = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u0433\u043E\u0441\u0442\u044F", "warn");
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      toast("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430", "warn");
      return;
    }
    setLoading(true);
    try {
      const nowD = /* @__PURE__ */ new Date();
      let resDate = bDate;
      if (bDate === "today") {
        resDate = nowD.toISOString().slice(0, 10);
      } else if (bDate === "tomorrow") {
        const tomorrow = new Date(nowD.getTime() + 864e5);
        resDate = tomorrow.toISOString().slice(0, 10);
      }
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        date: resDate,
        time: bTime,
        guests: Number(bGuests) || 2,
        zone: bZone,
        hall: bZone,
        comment: "\u0411\u0440\u043E\u043D\u044C \u0438\u0437 FENIX Terminal"
      };
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.ok) {
        toast(`\u0411\u0440\u043E\u043D\u044C #${data.codeFormatted || "WEB-" + data.code} \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0430!`, "ok", "check");
        if (onCreatedBooking) onCreatedBooking(data, payload);
        onClose();
      } else {
        toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0431\u0440\u043E\u043D\u0438: " + (data.error || "\u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430"), "danger");
      }
    } catch (err) {
      toast("\u0421\u0435\u0442\u0435\u0432\u0430\u044F \u043E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438", "danger");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React.createElement(Modal, { onClose, width: 480, label: "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0437\u0430\u044F\u0432\u043A\u0438" }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement(Icon, { name: "plus", size: 16, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("div", { className: "modal-title grow" }, "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \xB7 FENIX OS"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-icon btn-sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "seg", style: { width: "100%" } }, /* @__PURE__ */ React.createElement("button", { style: { flex: 1 }, "data-on": tab === "order" ? "1" : "0", onClick: () => setTab("order") }, /* @__PURE__ */ React.createElement(Icon, { name: "dpad", size: 13, style: { marginRight: 6 } }), "\u0417\u0430\u043A\u0430\u0437 \u043D\u0430 \u043A\u0443\u0445\u043D\u044E"), /* @__PURE__ */ React.createElement("button", { style: { flex: 1 }, "data-on": tab === "booking" ? "1" : "0", onClick: () => setTab("booking") }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 13, style: { marginRight: 6 } }), "\u0411\u0440\u043E\u043D\u044C \u0441\u0442\u043E\u043B\u0430")), tab === "order" ? /* @__PURE__ */ React.createElement("form", { onSubmit: submitOrder, style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0422\u0438\u043F \u0437\u0430\u043A\u0430\u0437\u0430"), /* @__PURE__ */ React.createElement("div", { className: "seg", style: { marginTop: 4, width: "100%" } }, /* @__PURE__ */ React.createElement("button", { type: "button", style: { flex: 1 }, "data-on": orderType === "delivery" ? "1" : "0", onClick: () => setOrderType("delivery") }, "\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430"), /* @__PURE__ */ React.createElement("button", { type: "button", style: { flex: 1 }, "data-on": orderType === "pickup" ? "1" : "0", onClick: () => setOrderType("pickup") }, "\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437"), /* @__PURE__ */ React.createElement("button", { type: "button", style: { flex: 1 }, "data-on": orderType === "hall" ? "1" : "0", onClick: () => setOrderType("hall") }, "\u0412 \u0437\u0430\u043B\u0435"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0418\u043C\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u0430 *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      required: true,
      className: "input",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: name,
      onChange: (e) => setName(e.target.value),
      placeholder: "\u0418\u043C\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u0430"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0422\u0435\u043B\u0435\u0444\u043E\u043D *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      required: true,
      className: "input mono",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: phone,
      onChange: (e) => setPhone(e.target.value),
      placeholder: "+998 90 123 45 67"
    }
  ))), orderType === "delivery" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: address,
      onChange: (e) => setAddress(e.target.value),
      placeholder: "\u042E\u043D\u0443\u0441\u0430\u0431\u0430\u0434, 12 \u043A\u0432\u0430\u0440\u0442\u0430\u043B, \u0434. 4"
    }
  )), orderType === "hall" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u041D\u043E\u043C\u0435\u0440 \u0441\u0442\u043E\u043B\u0430 / \u0417\u0430\u043B"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: table,
      onChange: (e) => setTable(e.target.value),
      placeholder: "\u0421\u0442\u043E\u043B 7 \xB7 \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u041F\u043E\u0437\u0438\u0446\u0438\u0438 \u043C\u0435\u043D\u044E (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: itemsNote,
      onChange: (e) => setItemsNote(e.target.value),
      placeholder: "\u041F\u043B\u043E\u0432 \xAB\u0424\u0435\u043D\u0438\u043A\u0441\xBB, \u0421\u0430\u043B\u0430\u0442 \u0410\u0447\u0438\u0447\u0443\u043A, \u0427\u0430\u0439"
    }
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u041E\u043F\u043B\u0430\u0442\u0430"), /* @__PURE__ */ React.createElement(
    "select",
    {
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: pay,
      onChange: (e) => setPay(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "card" }, "\u041A\u0430\u0440\u0442\u0430 / \u041E\u043D\u043B\u0430\u0439\u043D"),
    /* @__PURE__ */ React.createElement("option", { value: "cash" }, "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0421\u0443\u043C\u043C\u0430 (\u0441\u0443\u043C)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "input mono",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: total,
      onChange: (e) => setTotal(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot", style: { marginTop: 8, padding: 0 } }, /* @__PURE__ */ React.createElement(Btn, { type: "submit", variant: "accent", icon: "check", className: "grow", disabled: loading }, loading ? "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435..." : "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0432 \u043A\u0443\u0445\u043D\u044E"), /* @__PURE__ */ React.createElement(Btn, { type: "button", variant: "ghost", onClick: onClose }, "\u041E\u0442\u043C\u0435\u043D\u0430"))) : /* @__PURE__ */ React.createElement("form", { onSubmit: submitBooking, style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0418\u043C\u044F \u0433\u043E\u0441\u0442\u044F *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      required: true,
      className: "input",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: name,
      onChange: (e) => setName(e.target.value),
      placeholder: "\u0422\u0438\u043C\u0443\u0440 \u0421."
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0422\u0435\u043B\u0435\u0444\u043E\u043D *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      required: true,
      className: "input mono",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: phone,
      onChange: (e) => setPhone(e.target.value),
      placeholder: "+998 90 999 88 77"
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0414\u0430\u0442\u0430"), /* @__PURE__ */ React.createElement(
    "select",
    {
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: bDate,
      onChange: (e) => setBDate(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "today" }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F"),
    /* @__PURE__ */ React.createElement("option", { value: "tomorrow" }, "\u0417\u0430\u0432\u0442\u0440\u0430")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0412\u0440\u0435\u043C\u044F"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "time",
      className: "input mono",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: bTime,
      onChange: (e) => setBTime(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0433\u043E\u0441\u0442\u0435\u0439"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      min: "1",
      max: "40",
      className: "input mono",
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: bGuests,
      onChange: (e) => setBGuests(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0417\u0430\u043B / \u0417\u043E\u043D\u0430"), /* @__PURE__ */ React.createElement(
    "select",
    {
      style: { width: "100%", marginTop: 4, padding: "7px 10px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", outline: "none" },
      value: bZone,
      onChange: (e) => setBZone(e.target.value)
    },
    /* @__PURE__ */ React.createElement("option", { value: "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B" }, "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B"),
    /* @__PURE__ */ React.createElement("option", { value: "\u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439 \u0437\u0430\u043B" }, "\u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439 \u0437\u0430\u043B"),
    /* @__PURE__ */ React.createElement("option", { value: "VIP-\u043A\u0430\u0431\u0438\u043D\u0430" }, "VIP-\u043A\u0430\u0431\u0438\u043D\u0430")
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot", style: { marginTop: 8, padding: 0 } }, /* @__PURE__ */ React.createElement(Btn, { type: "submit", variant: "accent", icon: "check", className: "grow", disabled: loading }, loading ? "\u0411\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435..." : "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0442\u043E\u043B"), /* @__PURE__ */ React.createElement(Btn, { type: "button", variant: "ghost", onClick: onClose }, "\u041E\u0442\u043C\u0435\u043D\u0430")))));
}
Object.assign(window, { NAV, PAGE_META, Sidebar, Topbar, MobileBottomNav, CommandPalette, CreateModal, THEMES, DIRECTIONS });
const COLUMNS = [
  { id: "new", idx: "01", label: "new", tone: "var(--accent)" },
  { id: "kitchen", idx: "02", label: "kitchen", tone: "var(--info)" },
  { id: "way", idx: "03", label: "way", tone: "var(--violet)" },
  { id: "done", idx: "04", label: "done", tone: "var(--ok)" }
];
function Kpis({ t, orders = [], bookingsCount = 0 }) {
  const [expandedMobile, setExpandedMobile] = useState(false);
  const active = orders.filter((o) => o.col !== "done").length;
  const inKitchen = orders.filter((o) => o.col === "kitchen").length;
  const rev = orders.reduce((s, o) => s + (o.total || 0), 0);
  const late = orders.filter((o) => slaState(o).late && o.col !== "done").length;
  const newOrdersCount = orders.filter((o) => o.col === "new").length;
  const attentionCount = newOrdersCount + late;
  const cards = [
    {
      label: "active_orders",
      icon: "dpad",
      num: active,
      foot: inKitchen > 0 ? `${inKitchen} \u043D\u0430 \u043A\u0443\u0445\u043D\u0435` : active > 0 ? `${active} \u0432 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435` : "\u041A\u0443\u0445\u043D\u044F \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u0430",
      pills: [{ tone: active > 6 ? "warn" : "ok", text: active > 0 ? "\u041A\u0443\u0445\u043D\u044F \u0432 \u043D\u043E\u0440\u043C\u0435" : "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435" }]
    },
    {
      label: "revenue",
      icon: "wallet",
      num: summ(rev),
      suffix: "\u0441\u0443\u043C",
      serif: true,
      foot: `${t("checks")}: ${orders.length}`,
      pills: [{ tone: "ok", text: t("today") }],
      delta: orders.length > 0 ? `${orders.length} \u0437\u0430\u043A\u0430\u0437\u043E\u0432` : null,
      up: true
    },
    {
      label: "bookings_today",
      icon: "calendar",
      num: bookingsCount,
      foot: bookingsCount > 0 ? `${bookingsCount} \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0431\u0440\u043E\u043D\u0435\u0439` : "\u0411\u0440\u043E\u043D\u0435\u0439 \u043D\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u043D\u0435\u0442",
      pills: [{ tone: "info", text: "3 \u0437\u0430\u043B\u0430" }]
    },
    {
      label: "attention",
      icon: "alert",
      num: attentionCount,
      foot: newOrdersCount > 0 ? `${newOrdersCount} \u043D\u043E\u0432\u044B\u0445 \u0442\u0440\u0435\u0431\u0443\u044E\u0442 \u043E\u0442\u0432\u0435\u0442\u0430` : "\u0412\u0441\u0435 \u0437\u0430\u043A\u0430\u0437\u044B \u0432 \u0440\u0430\u0431\u043E\u0442\u0435",
      pills: [{ tone: attentionCount > 0 ? "warn" : "ok", text: attentionCount > 0 ? "\u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435" : "\u0412 \u043D\u043E\u0440\u043C\u0435" }],
      alert: attentionCount > 0
    }
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "kpis-container" }, /* @__PURE__ */ React.createElement("div", { className: "kpis-mobile-strip" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: "kpis-mobile-summary",
      onClick: () => setExpandedMobile((v) => !v),
      "aria-expanded": expandedMobile,
      title: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0440\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u044B\u0435 \u043C\u0435\u0442\u0440\u0438\u043A\u0438"
    },
    /* @__PURE__ */ React.createElement("div", { className: "kpis-mobile-items" }, /* @__PURE__ */ React.createElement("span", { className: "kpis-mobile-pill active" }, /* @__PURE__ */ React.createElement("span", { className: "kpis-dot active" }), /* @__PURE__ */ React.createElement("b", { className: "mono" }, active), " \u0432 \u0440\u0430\u0431\u043E\u0442\u0435"), /* @__PURE__ */ React.createElement("span", { className: "kpis-mobile-pill rev" }, /* @__PURE__ */ React.createElement("span", { className: "kpis-dot rev" }), /* @__PURE__ */ React.createElement("b", { className: "mono" }, summ(rev)), " \u0441\u0443\u043C"), attentionCount > 0 ? /* @__PURE__ */ React.createElement("span", { className: "kpis-mobile-pill warn" }, /* @__PURE__ */ React.createElement("span", { className: "kpis-dot warn" }), /* @__PURE__ */ React.createElement("b", { className: "mono" }, attentionCount), " \u0432\u043D\u0438\u043C.") : /* @__PURE__ */ React.createElement("span", { className: "kpis-mobile-pill" }, /* @__PURE__ */ React.createElement("span", { className: "kpis-dot info" }), /* @__PURE__ */ React.createElement("b", { className: "mono" }, bookingsCount), " \u0431\u0440\u043E\u043D.")),
    /* @__PURE__ */ React.createElement("span", { className: "kpis-mobile-toggle" }, /* @__PURE__ */ React.createElement("span", null, expandedMobile ? "\u0421\u043A\u0440\u044B\u0442\u044C" : "\u0421\u0432\u043E\u0434\u043A\u0430"), /* @__PURE__ */ React.createElement(Icon, { name: expandedMobile ? "chevronU" : "chevronD", size: 12 }))
  )), /* @__PURE__ */ React.createElement("div", { className: `kpis ${expandedMobile ? "mobile-expanded" : ""}` }, cards.map((c) => /* @__PURE__ */ React.createElement("div", { className: "card kpi", key: c.label }, /* @__PURE__ */ React.createElement("div", { className: "kpi-top" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, t(c.label)), /* @__PURE__ */ React.createElement("span", { className: "kpi-ico", style: c.alert ? { color: "var(--warn)", background: "var(--warn-soft)" } : void 0 }, /* @__PURE__ */ React.createElement(Icon, { name: c.icon, size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("div", { className: "stat-num" }, c.num, c.suffix && /* @__PURE__ */ React.createElement("small", null, c.suffix)), c.delta && /* @__PURE__ */ React.createElement("span", { className: "delta", "data-up": c.up ? "1" : "0" }, /* @__PURE__ */ React.createElement(Icon, { name: "arrowUp", size: 10, stroke: 2.2 }), c.delta)), /* @__PURE__ */ React.createElement("div", { className: "kpi-foot" }, /* @__PURE__ */ React.createElement("span", { className: "trunc" }, c.foot), c.pills.map((p) => /* @__PURE__ */ React.createElement(Pill, { key: p.text, tone: p.tone, dot: p.tone === "ok" }, /* @__PURE__ */ React.createElement("span", null, p.text))))))));
}
function OrderCard({ o, t, onOpen, onAdvance, sel, onPrint, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const s = slaState(o);
  const nextLabel = { new: "accept", kitchen: "ready", way: "mark_done", done: null }[o.col];
  return /* @__PURE__ */ React.createElement(
    "article",
    {
      className: "ocard",
      "data-sel": sel ? "1" : "0",
      "data-late": s.late ? "1" : "0",
      onClick: () => onOpen(o),
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "Enter") onOpen(o);
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "ocard-top" }, /* @__PURE__ */ React.createElement("span", { className: "oid" }, "#", o.id), o.col !== "done" && /* @__PURE__ */ React.createElement(SlaTime, { o, t }), o.col === "done" && /* @__PURE__ */ React.createElement("span", { className: "otime" }, /* @__PURE__ */ React.createElement(Icon, { name: "check", size: 10, stroke: 2.4 }), fmtElapsed(o.elapsed))),
    /* @__PURE__ */ React.createElement("div", { className: "ocard-tags" }, /* @__PURE__ */ React.createElement(TypeTag, { type: o.type, t })),
    /* @__PURE__ */ React.createElement("div", { className: "ocard-client" }, /* @__PURE__ */ React.createElement("span", { className: "oclient" }, o.client)),
    /* @__PURE__ */ React.createElement("div", { className: "ophone", style: { marginTop: 2 } }, o.phone),
    o.addr && /* @__PURE__ */ React.createElement("div", { className: "oaddr" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", { className: "oaddr-lbl" }, t("address")), /* @__PURE__ */ React.createElement("span", { className: "oaddr-txt" }, o.addr))),
    o.courier && /* @__PURE__ */ React.createElement("div", { className: "oaddr", style: { padding: "4px 8px", background: "var(--surface-3)", border: "1px solid var(--accent-line, var(--line))", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, marginTop: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "bike", size: 12, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, fontWeight: 600, color: "var(--accent-2)" } }, "\u041A\u0443\u0440\u044C\u0435\u0440: ", o.courier)),
    o.table && /* @__PURE__ */ React.createElement("div", { className: "oaddr", style: { padding: "5px 8px" } }, /* @__PURE__ */ React.createElement(Icon, { name: "grid", size: 11, style: { color: "var(--text-3)", marginTop: 1 } }), /* @__PURE__ */ React.createElement("span", { className: "oaddr-txt" }, o.table)),
    /* @__PURE__ */ React.createElement("div", { className: "oitems" }, o.items.slice(0, 3).map((it, i) => /* @__PURE__ */ React.createElement("div", { className: "oitem", key: i }, /* @__PURE__ */ React.createElement("span", { className: "oitem-n" }, it.n), /* @__PURE__ */ React.createElement("span", { className: "oitem-q" }, "\xD7 ", it.q))), o.items.length > 3 && /* @__PURE__ */ React.createElement("div", { className: "oitem" }, /* @__PURE__ */ React.createElement("span", { className: "oitem-n dim" }, "+", o.items.length - 3, " \u0435\u0449\u0451"))),
    o.col !== "done" && /* @__PURE__ */ React.createElement(SlaBar, { o }),
    /* @__PURE__ */ React.createElement("div", { className: "ocard-foot" }, /* @__PURE__ */ React.createElement("span", { className: "opay" }, /* @__PURE__ */ React.createElement(Icon, { name: o.pay === "card" ? "card" : "wallet", size: 11 }), t(o.pay)), /* @__PURE__ */ React.createElement("span", { className: "ototal" }, summ(o.total), /* @__PURE__ */ React.createElement("small", null, "\u0441\u0443\u043C"))),
    /* @__PURE__ */ React.createElement("div", { className: "ocard-actions", onClick: (e) => e.stopPropagation() }, nextLabel ? /* @__PURE__ */ React.createElement(
      Btn,
      {
        size: "sm",
        variant: o.col === "new" ? "accent" : void 0,
        icon: o.col === "new" ? "check" : o.col === "kitchen" ? "printer" : "check",
        onClick: () => onAdvance(o)
      },
      t(nextLabel)
    ) : /* @__PURE__ */ React.createElement("span", { className: "grow" }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(
      Btn,
      {
        size: "sm",
        variant: "ghost",
        className: "btn-icon",
        title: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441 \u0437\u0430\u043A\u0430\u0437\u043E\u043C",
        onClick: (e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "more", size: 13 })
    ), menuOpen && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "order-menu-scrim",
        onClick: (e) => {
          e.stopPropagation();
          setMenuOpen(false);
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "order-context-menu", role: "menu", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: (e) => {
          e.stopPropagation();
          setMenuOpen(false);
          onEdit && onEdit(o);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 13 }),
      /* @__PURE__ */ React.createElement("span", null, "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0437\u0430\u043A\u0430\u0437")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: (e) => {
          e.stopPropagation();
          setMenuOpen(false);
          onPrint && onPrint(o);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "printer", size: 13 }),
      /* @__PURE__ */ React.createElement("span", null, "\u041F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u0430")
    ), o.phone && /* @__PURE__ */ React.createElement(
      "a",
      {
        href: "tel:" + String(o.phone).replace(/\s/g, ""),
        className: "context-menu-item",
        onClick: (e) => {
          e.stopPropagation();
          setMenuOpen(false);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "phone", size: 13 }),
      /* @__PURE__ */ React.createElement("span", null, "\u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C \u043A\u043B\u0438\u0435\u043D\u0442\u0443")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item",
        onClick: (e) => {
          e.stopPropagation();
          setMenuOpen(false);
          onOpen && onOpen(o);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "bookStack", size: 13 }),
      /* @__PURE__ */ React.createElement("span", null, "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u0430")
    ), /* @__PURE__ */ React.createElement("div", { className: "context-menu-divider" }), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "context-menu-item danger",
        onClick: (e) => {
          e.stopPropagation();
          setMenuOpen(false);
          onDelete && onDelete(o);
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 13 }),
      /* @__PURE__ */ React.createElement("span", null, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437")
    )))))
  );
}
function OrderDrawer({ o, t, onClose, onAdvance, onPrint, onToast }) {
  const s = slaState(o);
  const steps = [
    { id: "new", label: t("accepted") || "\u041F\u0440\u0438\u043D\u044F\u0442" },
    { id: "kitchen", label: t("kitchen") },
    { id: "way", label: t("way") },
    { id: "done", label: t("done") }
  ];
  const curIdx = steps.findIndex((x) => x.id === o.col);
  return /* @__PURE__ */ React.createElement(Modal, { drawer: true, onClose, label: t("order_card") }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement(Icon, { name: "receipt", size: 15, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "modal-title" }, "#", o.id), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-3)" } }, o.createdAt ? new Date(o.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "")), s.late ? /* @__PURE__ */ React.createElement(Pill, { tone: "danger", dot: true }, t("late")) : /* @__PURE__ */ React.createElement(Pill, { tone: "ok", dot: true }, t("on_time")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-icon btn-sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: 15 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sect-title" }, t("stage")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, steps.map((st, i) => /* @__PURE__ */ React.createElement("div", { key: st.id, style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: {
    height: 3,
    borderRadius: 2,
    background: i <= curIdx ? "var(--accent)" : "var(--surface-3)"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    fontSize: 9,
    marginTop: 5,
    fontWeight: 600,
    color: i <= curIdx ? "var(--text)" : "var(--text-3)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  } }, st.label))))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 11, background: "var(--surface-2)" } }, /* @__PURE__ */ React.createElement("div", { className: "row", style: { marginBottom: 7 } }, /* @__PURE__ */ React.createElement(TypeTag, { type: o.type, t }), /* @__PURE__ */ React.createElement("span", { className: "grow" }), /* @__PURE__ */ React.createElement(SlaTime, { o, t })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("client")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 600, marginTop: 2 } }, o.client)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("phone")), /* @__PURE__ */ React.createElement("a", { href: "tel:" + o.phone.replace(/\s/g, ""), className: "mono", style: { fontSize: 11, marginTop: 2, display: "block", color: "var(--accent)", textDecoration: "none" } }, o.phone)), o.addr && /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("address")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, marginTop: 2, color: "var(--text-2)" } }, o.addr)), o.table && /* @__PURE__ */ React.createElement("div", { style: { gridColumn: "1 / -1" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("table")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, marginTop: 2 } }, o.table)), o.courier && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("courier")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, marginTop: 2 } }, o.courier)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("status")), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 3 } }, /* @__PURE__ */ React.createElement(Pill, { tone: s.late ? "danger" : "ok" }, s.late ? t("late") : t("on_time")))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sect-title" }, t("items")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "4px 11px" } }, o.items.map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "row", style: { padding: "8px 0", borderBottom: i < o.items.length - 1 ? "1px solid var(--line-soft)" : 0 } }, /* @__PURE__ */ React.createElement("span", { className: "grow", style: { fontSize: 11.5 } }, it.n), /* @__PURE__ */ React.createElement("span", { className: "mono dim", style: { fontSize: 10 } }, "\xD7 ", it.q), /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 11, minWidth: 62, textAlign: "right" } }, summ(it.q * it.p)))))), o.note && /* @__PURE__ */ React.createElement("div", { style: { padding: "9px 11px", borderRadius: "var(--r-sm)", background: "var(--warn-soft)", border: "1px solid color-mix(in srgb, var(--warn) 24%, transparent)" } }, /* @__PURE__ */ React.createElement("div", { className: "label", style: { color: "var(--warn)" } }, t("notes")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, marginTop: 2 } }, o.note)), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 11 } }, /* @__PURE__ */ React.createElement("div", { className: "row", style: { fontSize: 11.5, color: "var(--text-2)", marginBottom: 5 } }, /* @__PURE__ */ React.createElement("span", { className: "grow" }, t("subtotal")), /* @__PURE__ */ React.createElement("span", { className: "mono" }, summ(o.total - o.fee))), /* @__PURE__ */ React.createElement("div", { className: "row", style: { fontSize: 11.5, color: "var(--text-2)" } }, /* @__PURE__ */ React.createElement("span", { className: "grow" }, t("delivery_fee")), /* @__PURE__ */ React.createElement("span", { className: "mono" }, o.fee ? summ(o.fee) : "\u2014")), /* @__PURE__ */ React.createElement("div", { className: "row", style: { marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("span", { className: "grow", style: { fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-2)" } }, t("total")), /* @__PURE__ */ React.createElement("span", { className: "ototal", style: { fontSize: 17 } }, summ(o.total), /* @__PURE__ */ React.createElement("small", null, "\u0441\u0443\u043C")))), /* @__PURE__ */ React.createElement("div", { className: "row", style: { gap: 6 } }, /* @__PURE__ */ React.createElement(Btn, { icon: "phone", onClick: () => onToast("\u0417\u0432\u043E\u043D\u043E\u043A: " + o.phone), style: { flex: 1 } }, t("call_client")), /* @__PURE__ */ React.createElement(Btn, { icon: "printer", onClick: () => onPrint(o), style: { flex: 1 } }, t("print")))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement(Btn, { variant: "accent", icon: "check", className: "grow", onClick: () => onAdvance(o) }, o.col === "new" ? t("accept") : o.col === "kitchen" ? t("ready") : o.col === "way" ? t("mark_done") : t("done")), /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, t("close"))));
}
function ReceiptModal({ o, onClose, t }) {
  const r = FX.restaurant;
  const pad = (s, n) => String(s).padEnd(n, " ");
  const lpad = (s, n) => String(s).padStart(n, " ");
  const line = "=".repeat(44);
  const thin = "-".repeat(44);
  const dt = /* @__PURE__ */ new Date();
  const body = [
    line,
    "            FENIX RESTORAN",
    "        " + r.address.split(",")[0],
    "    " + r.address.slice(r.address.indexOf(",") + 1, 52),
    "       \u0418\u041D\u041D: " + r.inn,
    "      \u0422\u0435\u043B: " + r.phone,
    line,
    "\u0427\u0415\u041A \u0417\u0410\u041A\u0410\u0417\u0410: #" + o.id,
    "\u0412\u0420\u0415\u041C\u042F:   " + dt.toLocaleDateString("ru-RU") + " " + dt.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    "\u041A\u041B\u0418\u0415\u041D\u0422:  " + o.client,
    "\u0422\u0415\u041B\u0415\u0424\u041E\u041D: " + o.phone,
    "\u0421\u041C\u0415\u041D\u0410:   1 (\u043E\u0442\u043A\u0440\u044B\u0442\u0430)",
    "\u041A\u0410\u0421\u0421\u0418\u0420:  \u0414\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 01",
    "\u041E\u0424\u0418\u0426\u0418\u0410\u041D\u0422:" + (o.courier || " \u2014"),
    thin,
    "\u041D\u0410\u0418\u041C\u0415\u041D\u041E\u0412\u0410\u041D\u0418\u0415              \u041A\u041E\u041B-\u0412\u041E",
    thin,
    ...o.items.map((it) => pad(it.n.slice(0, 26), 26) + "\xD7" + lpad(it.q, 4)),
    thin,
    "\u0421\u0423\u041C\u041C\u0410:            " + lpad(summ(o.total - o.fee), 8),
    "\u0414\u041E\u0421\u0422\u0410\u0412\u041A\u0410:         " + lpad(summ(o.fee), 8),
    "\u0421\u041F\u041E\u0421\u041E\u0411 \u041E\u041F\u041B\u0410\u0422\u042B:    " + (o.pay === "card" ? "\u041A\u0430\u0440\u0442\u0430" : "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435"),
    line,
    "\u0418\u0422\u041E\u0413\u041E \u041A \u041E\u041F\u041B\u0410\u0422\u0415:   " + lpad(summ(o.total) + " \u0441\u0443\u043C", 8),
    line,
    "   \u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u0437\u0430\u043A\u0430\u0437!",
    "   " + r.site,
    line
  ].join("\n");
  return /* @__PURE__ */ React.createElement(Modal, { onClose, width: 430, label: t("print_fiscal") }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement(Icon, { name: "printer", size: 15, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("div", { className: "modal-title grow" }, t("print_fiscal")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-icon btn-sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "receipt-wrap", style: { padding: "13px", maxHeight: "58vh", overflow: "auto" } }, /* @__PURE__ */ React.createElement("div", { className: "receipt" }, body)), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement(Btn, { variant: "accent", icon: "printer", className: "grow", onClick: () => {
    window.print();
    onClose();
  } }, t("print_btn")), /* @__PURE__ */ React.createElement(Btn, { variant: "ghost", onClick: onClose }, t("close"))));
}
function EditOrderModal({ o, onClose, onSave, toast }) {
  const [client, setClient] = useState(o.client || "");
  const [phone, setPhone] = useState(o.phone || "");
  const [addr, setAddr] = useState(o.addr || o.table || "");
  const [total, setTotal] = useState(o.total || 0);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: o.dbId,
          orderNum: o.orderNum,
          client,
          phone,
          addr,
          total: Number(total)
        })
      });
      if (res.ok) {
        onSave && onSave({
          ...o,
          client,
          phone,
          addr: o.type === "delivery" ? addr : void 0,
          table: o.type === "hall" ? addr : void 0,
          total: Number(total)
        });
        toast && toast(`\u0417\u0430\u043A\u0430\u0437 #${o.id} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0451\u043D`, "ok", "check");
        onClose();
      } else {
        toast && toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0438 \u0437\u0430\u043A\u0430\u0437\u0430", "err", "alert");
      }
    } catch (err) {
      toast && toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0432\u044F\u0437\u0438 \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C: " + err.message, "err", "alert");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React.createElement(Modal, { onClose, label: `\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 #${o.id}` }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 16, style: { color: "var(--accent)" } }), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "modal-title" }, "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0437\u0430\u043A\u0430\u0437 #", o.id), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-3)" } }, "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u0445 \u043A\u043B\u0438\u0435\u043D\u0442\u0430 \u0438 \u0441\u0443\u043C\u043C\u044B")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-ghost btn-icon btn-sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit }, /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0418\u043C\u044F \u043A\u043B\u0438\u0435\u043D\u0442\u0430 *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      required: true,
      className: "input",
      value: client,
      onChange: (e) => setClient(e.target.value),
      placeholder: "\u0422\u0438\u043C\u0443\u0440",
      style: { width: "100%", marginTop: 5, padding: "8px 11px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)" }
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0422\u0435\u043B\u0435\u0444\u043E\u043D \u043A\u043B\u0438\u0435\u043D\u0442\u0430 *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      required: true,
      className: "input mono",
      value: phone,
      onChange: (e) => setPhone(e.target.value),
      placeholder: "+998901234567",
      style: { width: "100%", marginTop: 5, padding: "8px 11px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)" }
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, o.type === "delivery" ? "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" : "\u0421\u0442\u043E\u043B \u0432 \u0437\u0430\u043B\u0435"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      value: addr,
      onChange: (e) => setAddr(e.target.value),
      placeholder: o.type === "delivery" ? "\u0443\u043B. \u041D\u0430\u0432\u043E\u0438, 15" : "\u0421\u0442\u043E\u043B 4",
      style: { width: "100%", marginTop: 5, padding: "8px 11px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)" }
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "\u0418\u0442\u043E\u0433\u043E\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u0437\u0430\u043A\u0430\u0437\u0430 (\u0441\u0443\u043C)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "input mono",
      value: total,
      onChange: (e) => setTotal(e.target.value),
      style: { width: "100%", marginTop: 5, padding: "8px 11px", background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-xs)", color: "var(--text)", fontWeight: 700 }
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement(Btn, { type: "submit", variant: "accent", icon: "check", className: "grow", disabled: loading }, loading ? "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435..." : "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F"), /* @__PURE__ */ React.createElement(Btn, { type: "button", variant: "ghost", onClick: onClose }, "\u041E\u0442\u043C\u0435\u043D\u0430"))));
}
function DeleteConfirmModal({ o, onClose, onDeleted, toast }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: o.dbId,
          orderNum: o.orderNum
        })
      });
      if (res.ok) {
        onDeleted && onDeleted(o.id);
        toast && toast(`\u0417\u0430\u043A\u0430\u0437 #${o.id} \u0443\u0434\u0430\u043B\u0451\u043D \u0438\u0437 \u0431\u0430\u0437\u044B`, "warn", "trash");
        onClose();
      } else {
        toast && toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0438 \u0437\u0430\u043A\u0430\u0437\u0430", "err", "alert");
      }
    } catch (err) {
      toast && toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0432\u044F\u0437\u0438 \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C: " + err.message, "err", "alert");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React.createElement(Modal, { onClose, label: `\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437 #${o.id}` }, /* @__PURE__ */ React.createElement("div", { className: "modal-head" }, /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 16, style: { color: "var(--danger)" } }), /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { className: "modal-title", style: { color: "var(--danger)" } }, "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430 #", o.id), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "var(--text-3)" } }, "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn btn-ghost btn-icon btn-sm", onClick: onClose }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "modal-body", style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 13, color: "var(--text)", lineHeight: 1.5 } }, "\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437 ", /* @__PURE__ */ React.createElement("b", null, "#", o.id), " \u043A\u043B\u0438\u0435\u043D\u0442\u0430 ", /* @__PURE__ */ React.createElement("b", null, o.client), " \u043D\u0430 \u0441\u0443\u043C\u043C\u0443 ", /* @__PURE__ */ React.createElement("b", null, summ(o.total), " \u0441\u0443\u043C"), "?"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 11.5, color: "var(--danger)", background: "var(--danger-soft)", padding: "8px 12px", borderRadius: "var(--r-xs)" } }, "\u042D\u0442\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0431\u0435\u0437\u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043D\u043E \u0443\u0434\u0430\u043B\u0438\u0442 \u0437\u0430\u043F\u0438\u0441\u044C \u0438\u0437 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445 SQLite \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0430.")), /* @__PURE__ */ React.createElement("div", { className: "modal-foot" }, /* @__PURE__ */ React.createElement(Btn, { type: "button", variant: "danger", icon: "trash", className: "grow", disabled: loading, onClick: handleDelete }, loading ? "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435..." : "\u0414\u0430, \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437"), /* @__PURE__ */ React.createElement(Btn, { type: "button", variant: "ghost", onClick: onClose }, "\u041E\u0442\u043C\u0435\u043D\u0430")));
}
function Dispatch({ t, orders, dispatch, view, setView, onOpen, onAdvance, onPrint, toast, lang, bookingsCount = 0, onUpdateOrder, onDeleteOrder }) {
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("all");
  const [sort, setSort] = useState("sla");
  const [mobileStage, setMobileStage] = useState("new");
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const filtered = useMemo(() => {
    let list = orders.filter((o) => {
      if (q) {
        const hay = (o.id + o.client + o.phone + (o.addr || "")).toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (typeF !== "all" && o.type !== typeF) return false;
      return true;
    });
    if (sort === "sla") list = [...list].sort((a, b) => b.elapsed / b.sla - a.elapsed / a.sla);
    if (sort === "total") list = [...list].sort((a, b) => b.total - a.total);
    return list;
  }, [orders, q, typeF, sort]);
  const lateCount = filtered.filter((o) => slaState(o).late && o.col !== "done").length;
  const newCount = filtered.filter((o) => o.col === "new").length;
  return /* @__PURE__ */ React.createElement("div", { className: "page page-flush dispatch-page" }, /* @__PURE__ */ React.createElement(Kpis, { t, orders, bookingsCount }), /* @__PURE__ */ React.createElement("div", { className: "dispatch-toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "dispatch-toolbar-left" }, /* @__PURE__ */ React.createElement("div", { className: "chips" }, ["all", "delivery", "pickup", "hall"].map((k) => /* @__PURE__ */ React.createElement("button", { key: k, className: "chip", "data-on": typeF === k ? "1" : "0", onClick: () => setTypeF(k) }, k === "all" ? t("all") : t(k)))), lateCount > 0 && /* @__PURE__ */ React.createElement(Pill, { tone: "danger", dot: true }, lateCount, " ", t("late"))), /* @__PURE__ */ React.createElement("div", { className: "dispatch-toolbar-center" }, /* @__PURE__ */ React.createElement("div", { className: "search" }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 13 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      value: q,
      onChange: (e) => setQ(e.target.value),
      placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043D\u043E\u043C\u0435\u0440\u0443, \u0438\u043C\u0435\u043D\u0438 \u0438\u043B\u0438 \u0430\u0434\u0440\u0435\u0441\u0443..."
    }
  ), q ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-ghost btn-icon btn-sm", onClick: () => setQ(""), title: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C" }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 11 })) : /* @__PURE__ */ React.createElement("span", { className: "kbd hide-mobile" }, "\u2318K"))), /* @__PURE__ */ React.createElement("div", { className: "dispatch-toolbar-right" }, /* @__PURE__ */ React.createElement("div", { className: "seg hide-mobile" }, /* @__PURE__ */ React.createElement("button", { "data-on": sort === "sla" ? "1" : "0", onClick: () => setSort("sla"), title: "\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \u0441\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u0438 SLA" }, "SLA"), /* @__PURE__ */ React.createElement("button", { "data-on": sort === "total" ? "1" : "0", onClick: () => setSort("total"), title: "\u041F\u043E \u0441\u0443\u043C\u043C\u0435 \u0447\u0435\u043A\u0430" }, "\u03A3")), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { "data-on": view === "board" ? "1" : "0", onClick: () => setView("board"), title: t("board") }, /* @__PURE__ */ React.createElement(Icon, { name: "grid", size: 12 })), /* @__PURE__ */ React.createElement("button", { "data-on": view === "list" ? "1" : "0", onClick: () => setView("list"), title: t("list") }, /* @__PURE__ */ React.createElement(Icon, { name: "bookStack", size: 12 }))), newCount > 0 && /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "check", onClick: () => dispatch("acceptAll"), title: t("accept_all") }, /* @__PURE__ */ React.createElement("span", null, t("accept_all"))))), view === "board" && /* @__PURE__ */ React.createElement("div", { className: "mobile-stage-tabs", role: "tablist", "aria-label": "\u0421\u0442\u0430\u0442\u0443\u0441\u044B \u0437\u0430\u043A\u0430\u0437\u043E\u0432" }, COLUMNS.map((c) => {
    const list = filtered.filter((o) => o.col === c.id);
    const on = mobileStage === c.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: c.id,
        type: "button",
        role: "tab",
        "aria-selected": on,
        className: "mobile-stage-tab",
        "data-on": on ? "1" : "0",
        onClick: () => setMobileStage(c.id),
        style: { "--stage-tone": c.tone }
      },
      /* @__PURE__ */ React.createElement("span", { className: "mobile-stage-tab-name" }, t(c.label)),
      /* @__PURE__ */ React.createElement("span", { className: "mobile-stage-tab-badge", "data-tone": c.id === "new" && list.length > 0 ? "accent" : "normal" }, list.length)
    );
  })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", paddingBottom: 14 } }, view === "board" ? /* @__PURE__ */ React.createElement("div", { className: "board dispatch-board", "data-mobile-stage": mobileStage }, COLUMNS.map((c) => {
    const list = filtered.filter((o) => o.col === c.id);
    const isMobileActive = mobileStage === c.id;
    return /* @__PURE__ */ React.createElement(
      "section",
      {
        className: `col ${isMobileActive ? "mobile-active-stage" : "mobile-inactive-stage"}`,
        key: c.id,
        "data-screen-label": t(c.label)
      },
      /* @__PURE__ */ React.createElement("div", { className: "col-head", style: { "--col-tone": c.tone } }, /* @__PURE__ */ React.createElement("span", { className: "col-idx" }, c.idx), /* @__PURE__ */ React.createElement("span", { className: "col-name" }, t(c.label)), /* @__PURE__ */ React.createElement("span", { className: "col-count" }, list.length)),
      /* @__PURE__ */ React.createElement("div", { className: "col-body" }, list.map((o) => /* @__PURE__ */ React.createElement(
        OrderCard,
        {
          key: o.id,
          o,
          t,
          onOpen,
          onAdvance,
          onPrint,
          onEdit: (ord) => setEditingOrder(ord),
          onDelete: (ord) => setDeletingOrder(ord)
        }
      )), !list.length && /* @__PURE__ */ React.createElement("div", { className: "empty" }, /* @__PURE__ */ React.createElement(Icon, { name: "box", size: 22 }), /* @__PURE__ */ React.createElement("span", null, c.id === "new" ? "\u041D\u043E\u0432\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u043D\u0435\u0442" : c.id === "kitchen" ? "\u041D\u0430 \u043A\u0443\u0445\u043D\u0435 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E" : c.id === "way" ? "\u041D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u0432 \u043F\u0443\u0442\u0438" : "\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u043D\u0435\u0442")))
    );
  })) : /* @__PURE__ */ React.createElement("div", { className: "card tbl-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "tbl" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "ID"), /* @__PURE__ */ React.createElement("th", null, t("client")), /* @__PURE__ */ React.createElement("th", null, t("status")), /* @__PURE__ */ React.createElement("th", null, t("items")), /* @__PURE__ */ React.createElement("th", null, "SLA"), /* @__PURE__ */ React.createElement("th", null, t("courier"), " / ", t("address")), /* @__PURE__ */ React.createElement("th", { className: "tbl-right" }, t("total")))), /* @__PURE__ */ React.createElement("tbody", null, filtered.map((o) => {
    const s = slaState(o);
    return /* @__PURE__ */ React.createElement("tr", { key: o.id, "data-late": s.late ? "1" : "0", onClick: () => onOpen(o) }, /* @__PURE__ */ React.createElement("td", { className: "mono" }, "#", o.id), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600 } }, o.client), /* @__PURE__ */ React.createElement("div", { className: "dim mono", style: { fontSize: 9.5 } }, o.phone)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(Pill, { tone: COL_TONE[o.col] }, t(o.col))), /* @__PURE__ */ React.createElement("td", { className: "dim" }, o.items.length, " \u043F\u043E\u0437."), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(SlaTime, { o, t })), /* @__PURE__ */ React.createElement("td", { className: "dim trunc", style: { maxWidth: 190 } }, o.courier || o.addr || o.table || "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "tbl-right mono", style: { fontWeight: 700 } }, summ(o.total)));
  }))))), editingOrder && /* @__PURE__ */ React.createElement(
    EditOrderModal,
    {
      o: editingOrder,
      onClose: () => setEditingOrder(null),
      onSave: (updated) => {
        onUpdateOrder && onUpdateOrder(updated);
      },
      toast
    }
  ), deletingOrder && /* @__PURE__ */ React.createElement(
    DeleteConfirmModal,
    {
      o: deletingOrder,
      onClose: () => setDeletingOrder(null),
      onDeleted: (id) => {
        onDeleteOrder && onDeleteOrder(id);
      },
      toast
    }
  ));
}
const COL_TONE = { new: "accent", kitchen: "info", way: "violet", done: "ok" };
Object.assign(window, { Dispatch, OrderDrawer, ReceiptModal, EditOrderModal, DeleteConfirmModal, Kpis, COLUMNS, COL_TONE, OrderCard });
const BOOK_TONE = { pending: "warn", confirmed: "ok", seated: "info", cancelled: "muted" };
function isTodayDate(dStr) {
  if (!dStr) return false;
  if (dStr === "today") return true;
  const now = /* @__PURE__ */ new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const iso = `${yyyy}-${mm}-${dd}`;
  const ru = `${dd}.${mm}.${yyyy}`;
  return String(dStr).includes(iso) || String(dStr).includes(ru);
}
function isTomorrowDate(dStr) {
  if (!dStr) return false;
  if (dStr === "tomorrow") return true;
  const tom = new Date(Date.now() + 864e5);
  const yyyy = tom.getFullYear();
  const mm = String(tom.getMonth() + 1).padStart(2, "0");
  const dd = String(tom.getDate()).padStart(2, "0");
  const iso = `${yyyy}-${mm}-${dd}`;
  const ru = `${dd}.${mm}.${yyyy}`;
  return String(dStr).includes(iso) || String(dStr).includes(ru);
}
function Bookings({ t, toast }) {
  const [date, setDate] = useState("all");
  const [zone, setZone] = useState("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState(FX.bookings);
  const [actionMenuBooking, setActionMenuBooking] = useState(null);
  useEffect(() => {
    let active = true;
    const fetchReservations = async () => {
      try {
        const res = await fetch("/api/admin/reservations");
        if (!res.ok) return;
        const data = await res.json();
        if (active && data && data.ok && Array.isArray(data.reservations)) {
          const mapped = data.reservations.map((r) => {
            let status = "pending";
            const s = (r.status || "").toLowerCase();
            if (s.includes("\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434") || s === "confirmed") status = "confirmed";
            else if (s.includes("\u043F\u043E\u0441\u0430\u0436\u0435\u043D") || s === "seated") status = "seated";
            else if (s.includes("\u043E\u0442\u043C\u0435\u043D\u0435\u043D") || s === "cancelled") status = "cancelled";
            return {
              id: r.codeFormatted || `WEB-${r.code}`,
              code: r.code,
              dbId: r.id,
              date: r.date || "today",
              client: r.customerName || "\u0413\u043E\u0441\u0442\u044C",
              phone: r.customerPhone || "\u2014",
              guests: parseInt(r.guests) || 2,
              zone: r.zone || "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B",
              time: r.time || "19:00",
              status,
              table: r.table || "\u2014"
            };
          });
          setRows(mapped);
        }
      } catch (e) {
        console.error("Error fetching reservations:", e);
      }
    };
    fetchReservations();
    const iv = setInterval(fetchReservations, 7e3);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, []);
  const matchesDate = (b) => {
    if (date === "all") return true;
    if (date === "today") return isTodayDate(b.date);
    if (date === "tomorrow") return isTomorrowDate(b.date);
    return b.date === date;
  };
  const list = rows.filter((b) => {
    if (!matchesDate(b)) return false;
    if (zone !== "all" && b.zone !== zone) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchClient = (b.client || "").toLowerCase().includes(q);
      const matchPhone = (b.phone || "").toLowerCase().includes(q);
      const matchId = (b.id || "").toLowerCase().includes(q);
      const matchTable = (b.table || "").toLowerCase().includes(q);
      if (!matchClient && !matchPhone && !matchId && !matchTable) return false;
    }
    return true;
  });
  const pending = rows.filter((b) => b.status === "pending").length;
  const bookingsTodayCount = rows.filter((b) => isTodayDate(b.date)).length;
  const act = async (id, status, newTable = null) => {
    setRows((r) => r.map((b) => b.id === id ? { ...b, status, ...newTable !== null ? { table: newTable || "\u2014" } : {} } : b));
    const msg = status === "confirmed" ? "\u0411\u0440\u043E\u043D\u044C \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430" : status === "seated" ? "\u0413\u043E\u0441\u0442\u0438 \u043F\u043E\u0441\u0430\u0436\u0435\u043D\u044B" : status === "pending" ? "\u0411\u0440\u043E\u043D\u044C \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0430 \u0432 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0435" : "\u0411\u0440\u043E\u043D\u044C \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430";
    toast(msg, status === "cancelled" ? "warn" : "ok");
    const backendStatus = status === "confirmed" ? "\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430" : status === "seated" ? "\u043F\u043E\u0441\u0430\u0436\u0435\u043D" : status === "pending" ? "\u043E\u0436\u0438\u0434\u0430\u0435\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F" : "\u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430";
    const target = rows.find((b) => b.id === id);
    const code = target?.code || parseInt(String(id).replace(/\D/g, ""));
    const tableToPersist = newTable !== null ? newTable || "" : target?.table && target?.table !== "\u2014" ? target.table : "";
    try {
      await fetch("/api/admin/reservations/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: target?.dbId,
          code,
          status: backendStatus,
          table: tableToPersist
        })
      });
    } catch (e) {
      console.error("Error updating reservation status:", e);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "kpis" }, [
    { l: "bookings_today", v: bookingsTodayCount, f: "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B \xB7 VIP \xB7 \u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439" },
    { l: "pending", v: pending, f: "\u0422\u0440\u0435\u0431\u0443\u044E\u0442 \u043E\u0442\u0432\u0435\u0442\u0430 \u0441\u0435\u0439\u0447\u0430\u0441", warn: true },
    { l: "guests", v: rows.reduce((s, b) => s + b.guests, 0), f: "\u0421\u0443\u043C\u043C\u0430\u0440\u043D\u043E \u043F\u043E \u0432\u0441\u0435\u043C \u0431\u0440\u043E\u043D\u044F\u043C" },
    { l: "confirmed", v: rows.filter((b) => b.status === "confirmed").length, f: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u043E\u043C" }
  ].map((c) => /* @__PURE__ */ React.createElement("div", { className: "card kpi", key: c.l }, /* @__PURE__ */ React.createElement("div", { className: "kpi-top" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, t(c.l)), /* @__PURE__ */ React.createElement("span", { className: "kpi-ico", style: c.warn ? { color: "var(--warn)", background: "var(--warn-soft)" } : void 0 }, /* @__PURE__ */ React.createElement(Icon, { name: c.warn ? "alert" : "calendar", size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("div", { className: "stat-num" }, c.v)), /* @__PURE__ */ React.createElement("div", { className: "kpi-foot" }, /* @__PURE__ */ React.createElement("span", { className: "trunc" }, c.f))))), /* @__PURE__ */ React.createElement("div", { className: "venue-toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "venue-toolbar-filters" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("span", { className: "filter-group-tag" }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 13 }), /* @__PURE__ */ React.createElement("span", null, t("date"))), /* @__PURE__ */ React.createElement("div", { className: "filter-pills" }, [["all", "all_dates"], ["today", "today"], ["tomorrow", "tomorrow"]].map(([k, l]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: k,
      className: "filter-pill",
      "data-on": date === k ? "1" : "0",
      onClick: () => setDate(k)
    },
    t(l)
  )))), /* @__PURE__ */ React.createElement("div", { className: "filter-divider" }), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("span", { className: "filter-group-tag" }, /* @__PURE__ */ React.createElement(Icon, { name: "layers", size: 13 }), /* @__PURE__ */ React.createElement("span", null, t("zone"))), /* @__PURE__ */ React.createElement("div", { className: "filter-pills" }, [
    ["all", "all_zones"],
    ["\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B", "main_hall"],
    ["\u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439 \u0437\u0430\u043B", "banquet_hall"],
    ["VIP-\u043A\u0430\u0431\u0438\u043D\u0430", "vip"],
    ["any", "any"]
  ].map(([k, l]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: k,
      className: "filter-pill",
      "data-on": zone === k ? "1" : "0",
      onClick: () => setZone(k)
    },
    l === "any" ? "\u041B\u044E\u0431\u043E\u0439" : t(l)
  ))))), /* @__PURE__ */ React.createElement("div", { className: "venue-toolbar-search" }, /* @__PURE__ */ React.createElement("div", { className: "search", style: { height: 34, width: "100%", maxWidth: "100%", borderRadius: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0433\u043E\u0441\u0442\u044E, \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0443, \u0441\u0442\u043E\u043B\u0443..."
    }
  ), search && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSearch(""),
      style: { border: 0, background: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", padding: 2 },
      title: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })
  ))), /* @__PURE__ */ React.createElement("div", { className: "venue-toolbar-actions" }, /* @__PURE__ */ React.createElement(Pill, { tone: "neutral" }, list.length, " \u0431\u0440\u043E\u043D\u0435\u0439"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "plus", onClick: () => toast("\u0424\u043E\u0440\u043C\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0431\u0440\u043E\u043D\u0438", "ok", "plus") }, t("create")))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, /* @__PURE__ */ React.createElement("table", { className: "tbl", style: { tableLayout: "fixed", width: "100%", minWidth: 920 } }, /* @__PURE__ */ React.createElement("colgroup", null, /* @__PURE__ */ React.createElement("col", { style: { width: "75px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "95px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "65px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "155px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "125px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "115px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "70px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "75px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "105px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "80px" } })), /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { paddingLeft: 18, textAlign: "left" } }, t("id")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("date")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("time")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("client")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("phone")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("zone")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", paddingRight: 16 } }, t("guests")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("table")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, t("status")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", paddingRight: 18 } }, t("actions")))), /* @__PURE__ */ React.createElement("tbody", null, list.map((b) => /* @__PURE__ */ React.createElement("tr", { key: b.id + b.time, style: { cursor: "default" } }, /* @__PURE__ */ React.createElement("td", { className: "mono dim", style: { paddingLeft: 18 } }, "#", b.id), /* @__PURE__ */ React.createElement("td", { style: { whiteSpace: "nowrap" } }, b.date === "today" ? t("today") : b.date === "tomorrow" ? t("tomorrow") : b.date), /* @__PURE__ */ React.createElement("td", { className: "mono", style: { fontWeight: 600 } }, b.time), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 600 }, className: "trunc" }, b.client), /* @__PURE__ */ React.createElement("td", { className: "mono dim", style: { fontSize: 11 } }, b.phone), /* @__PURE__ */ React.createElement("td", { className: "dim trunc" }, b.zone === "any" ? "\u041B\u044E\u0431\u043E\u0439" : b.zone), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", paddingRight: 16, fontFamily: "var(--f-mono)", fontVariantNumeric: "tabular-nums", fontWeight: 600 } }, /* @__PURE__ */ React.createElement("span", { className: "row", style: { justifyContent: "flex-end", gap: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 12, style: { color: "var(--text-3)" } }), b.guests)), /* @__PURE__ */ React.createElement("td", { className: "dim trunc" }, b.table || "\u2014"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(Pill, { tone: BOOK_TONE[b.status], dot: b.status === "pending" }, t(b.status === "pending" ? "pending_b" : b.status))), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", paddingRight: 18 } }, b.status === "pending" ? /* @__PURE__ */ React.createElement("span", { className: "row", style: { justifyContent: "flex-end", gap: 4 } }, /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "check", onClick: () => act(b.id, "confirmed") }, t("confirm")), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "ghost", className: "btn-icon", onClick: () => act(b.id, "cancelled") }, /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "ghost", icon: "more", onClick: () => setActionMenuBooking(b) })) : /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "ghost", icon: "more", onClick: () => setActionMenuBooking(b) })))), !list.length && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "10", style: { textAlign: "center", padding: "38px 12px", color: "var(--text-3)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 24, style: { display: "block", margin: "0 auto 8px", opacity: 0.5 } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--text-2)" } }, "\u0411\u0440\u043E\u043D\u0435\u0439 \u043D\u0430 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u0443\u044E \u0434\u0430\u0442\u0443 \u043D\u0435\u0442"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, marginTop: 3 } }, "\u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u044F\u0432\u043A\u0438 \u043D\u0430 \u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0442\u043E\u043B\u043E\u0432 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438")))))), !list.length && /* @__PURE__ */ React.createElement("div", { className: "empty", style: { padding: 40 } }, /* @__PURE__ */ React.createElement(Icon, { name: "calendar", size: 24 }), /* @__PURE__ */ React.createElement("span", null, t("no_bookings")))), actionMenuBooking && /* @__PURE__ */ React.createElement(Modal, { onClose: () => setActionMenuBooking(null), width: 460, label: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F \u0441 \u0431\u0440\u043E\u043D\u044C\u044E" }, /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 8px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "var(--text)" } }, "\u0411\u0440\u043E\u043D\u044C #", actionMenuBooking.id), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--dim)", marginTop: 2 } }, actionMenuBooking.client, " \xB7 ", actionMenuBooking.phone)), /* @__PURE__ */ React.createElement(Pill, { tone: BOOK_TONE[actionMenuBooking.status] }, actionMenuBooking.status === "seated" ? "\u041F\u043E\u0441\u0430\u0436\u0435\u043D \u0432 \u0437\u0430\u043B\u0435" : actionMenuBooking.status === "confirmed" ? "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u043E" : actionMenuBooking.status === "pending" ? "\u0412 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0438" : "\u041E\u0442\u043C\u0435\u043D\u0435\u043D\u043E")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { background: "var(--surface-2)", padding: "12px 14px", marginBottom: 16, fontSize: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--dim)" } }, "\u0414\u0430\u0442\u0430:"), " ", /* @__PURE__ */ React.createElement("b", null, actionMenuBooking.date)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--dim)" } }, "\u0412\u0440\u0435\u043C\u044F:"), " ", /* @__PURE__ */ React.createElement("b", null, actionMenuBooking.time)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--dim)" } }, "\u0417\u0430\u043B:"), " ", /* @__PURE__ */ React.createElement("b", null, actionMenuBooking.zone)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--dim)" } }, "\u0413\u043E\u0441\u0442\u0435\u0439:"), " ", /* @__PURE__ */ React.createElement("b", null, actionMenuBooking.guests, " \u0447\u0435\u043B."))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("label", { style: { display: "block", fontSize: 11, color: "var(--dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" } }, "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044B\u0439 \u0441\u0442\u043E\u043B:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: actionMenuBooking.table && actionMenuBooking.table !== "\u2014" ? actionMenuBooking.table : "",
      onChange: (e) => {
        const newTb = e.target.value;
        act(actionMenuBooking.id, actionMenuBooking.status, newTb);
        setActionMenuBooking((prev) => ({ ...prev, table: newTb }));
      },
      style: {
        width: "100%",
        height: 32,
        borderRadius: 6,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--text)",
        fontSize: 12,
        padding: "0 8px",
        outline: "none"
      }
    },
    /* @__PURE__ */ React.createElement("option", { value: "" }, "-- \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u043E\u043B --"),
    ["\u0421\u0442\u043E\u043B 1", "\u0421\u0442\u043E\u043B 2", "\u0421\u0442\u043E\u043B 3", "\u0421\u0442\u043E\u043B 4", "\u0421\u0442\u043E\u043B 5", "\u0421\u0442\u043E\u043B 6", "\u0421\u0442\u043E\u043B 7", "\u0421\u0442\u043E\u043B 8", "\u0421\u0442\u043E\u043B 9", "\u0421\u0442\u043E\u043B 10", "\u0421\u0442\u043E\u043B 11", "\u0421\u0442\u043E\u043B 12", "VIP 1", "VIP 2", "\u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439 \u0437\u0430\u043B"].map((tName) => /* @__PURE__ */ React.createElement("option", { key: tName, value: tName }, tName))
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, actionMenuBooking.status !== "seated" && /* @__PURE__ */ React.createElement(
    Btn,
    {
      size: "md",
      variant: "accent",
      icon: "users",
      onClick: () => {
        act(actionMenuBooking.id, "seated");
        setActionMenuBooking(null);
      }
    },
    "\u041F\u043E\u0441\u0430\u0434\u0438\u0442\u044C \u0433\u043E\u0441\u0442\u0435\u0439 (\u0413\u043E\u0441\u0442\u0438 \u0432 \u0437\u0430\u043B\u0435)"
  ), actionMenuBooking.status !== "confirmed" && /* @__PURE__ */ React.createElement(
    Btn,
    {
      size: "md",
      variant: "ghost",
      icon: "check",
      onClick: () => {
        act(actionMenuBooking.id, "confirmed");
        setActionMenuBooking(null);
      }
    },
    "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0431\u0440\u043E\u043D\u044C"
  ), actionMenuBooking.status !== "pending" && /* @__PURE__ */ React.createElement(
    Btn,
    {
      size: "md",
      variant: "ghost",
      icon: "clock",
      onClick: () => {
        act(actionMenuBooking.id, "pending");
        setActionMenuBooking(null);
      }
    },
    "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0432 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0435"
  ), actionMenuBooking.status !== "cancelled" && /* @__PURE__ */ React.createElement(
    Btn,
    {
      size: "md",
      variant: "ghost",
      icon: "x",
      style: { color: "var(--err)" },
      onClick: () => {
        act(actionMenuBooking.id, "cancelled");
        setActionMenuBooking(null);
      }
    },
    "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `tel:${actionMenuBooking.phone}`,
      className: "btn btn-md",
      style: {
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "var(--surface-3)",
        color: "var(--text)",
        borderRadius: 8,
        fontWeight: 600,
        marginTop: 4
      }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "phone", size: 14 }),
    "\u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C \u0433\u043E\u0441\u0442\u044E (",
    actionMenuBooking.phone,
    ")"
  )))));
}
function Banquets({ t, toast }) {
  const [rows, setRows] = useState(FX.banquets);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  useEffect(() => {
    let active = true;
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/admin/events");
        if (!res.ok) return;
        const data = await res.json();
        if (active && data && data.ok && Array.isArray(data.events)) {
          const mapped = data.events.map((ev) => ({
            id: ev.eventId ? `BNQ-${ev.eventId}` : `BNQ-${ev.id}`,
            eventId: ev.eventId || ev.id,
            dbId: ev.id,
            date: ev.eventDate || "2026-11-20",
            client: ev.customerName || "\u0417\u0430\u043A\u0430\u0437\u0447\u0438\u043A",
            phone: ev.customerPhone || "\u2014",
            kind: ev.eventType || "\u0411\u0430\u043D\u043A\u0435\u0442",
            guests: parseInt(ev.guests) || 30,
            hall: ev.hall || "\u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439 \u0437\u0430\u043B",
            deposit: 5e6,
            status: (ev.status || "").includes("\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434") ? "confirmed" : "waiting"
          }));
          setRows(mapped);
        }
      } catch (e) {
        console.error("Error fetching events:", e);
      }
    };
    fetchEvents();
    const iv = setInterval(fetchEvents, 1e4);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, []);
  const confirmBanquet = async (b) => {
    setRows((r) => r.map((x) => x.id === b.id ? { ...x, status: "confirmed" } : x));
    toast("\u0411\u0430\u043D\u043A\u0435\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D", "ok");
    try {
      await fetch("/api/admin/events/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: b.dbId,
          eventId: b.eventId || parseInt(String(b.id).replace(/\D/g, "")),
          status: "\u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0430"
        })
      });
    } catch (_) {
    }
  };
  const filteredRows = rows.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchClient = (b.client || "").toLowerCase().includes(q);
      const matchPhone = (b.phone || "").toLowerCase().includes(q);
      const matchId = (b.id || "").toLowerCase().includes(q);
      const matchHall = (b.hall || "").toLowerCase().includes(q);
      if (!matchClient && !matchPhone && !matchId && !matchHall) return false;
    }
    return true;
  });
  const total = rows.reduce((s, b) => s + b.deposit, 0);
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "kpis" }, [
    { l: "banquets", v: rows.length, f: "\u041D\u043E\u044F\u0431\u0440\u044C \u2014 \u0434\u0435\u043A\u0430\u0431\u0440\u044C 2026" },
    { l: "pending", v: rows.filter((b) => b.status === "waiting").length, f: "\u0416\u0434\u0443\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430", warn: true },
    { l: "deposit", v: summ(total), f: "\u0421\u0443\u043C\u043C\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0432", serif: true },
    { l: "guests", v: rows.reduce((s, b) => s + b.guests, 0), f: "\u0417\u0430\u044F\u0432\u043B\u0435\u043D\u043D\u044B\u0445 \u0433\u043E\u0441\u0442\u0435\u0439" }
  ].map((c) => /* @__PURE__ */ React.createElement("div", { className: "card kpi", key: c.l }, /* @__PURE__ */ React.createElement("div", { className: "kpi-top" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, t(c.l)), /* @__PURE__ */ React.createElement("span", { className: "kpi-ico", style: c.warn ? { color: "var(--warn)", background: "var(--warn-soft)" } : void 0 }, /* @__PURE__ */ React.createElement(Icon, { name: c.warn ? "alert" : "star", size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("div", { className: "stat-num" }, c.v)), /* @__PURE__ */ React.createElement("div", { className: "kpi-foot" }, /* @__PURE__ */ React.createElement("span", { className: "trunc" }, c.f))))), /* @__PURE__ */ React.createElement("div", { className: "venue-toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "venue-toolbar-filters" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("span", { className: "filter-group-tag" }, /* @__PURE__ */ React.createElement(Icon, { name: "star", size: 13 }), /* @__PURE__ */ React.createElement("span", null, "\u0421\u0442\u0430\u0442\u0443\u0441")), /* @__PURE__ */ React.createElement("div", { className: "filter-pills" }, [
    ["all", "\u0412\u0441\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F"],
    ["waiting", "\u041E\u0436\u0438\u0434\u0430\u044E\u0442"],
    ["confirmed", "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u044B"]
  ].map(([k, label]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: k,
      className: "filter-pill",
      "data-on": statusFilter === k ? "1" : "0",
      onClick: () => setStatusFilter(k)
    },
    label
  ))))), /* @__PURE__ */ React.createElement("div", { className: "venue-toolbar-search" }, /* @__PURE__ */ React.createElement("div", { className: "search", style: { height: 34, width: "100%", maxWidth: "100%", borderRadius: 8 } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14 }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "\u041F\u043E\u0438\u0441\u043A \u0431\u0430\u043D\u043A\u0435\u0442\u0430 \u043F\u043E \u043A\u043B\u0438\u0435\u043D\u0442\u0443, \u0437\u0430\u043B\u0443..."
    }
  ), search && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSearch(""),
      style: { border: 0, background: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", padding: 2 },
      title: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 12 })
  ))), /* @__PURE__ */ React.createElement("div", { className: "venue-toolbar-actions" }, /* @__PURE__ */ React.createElement(Pill, { tone: "neutral" }, filteredRows.length, " \u0441\u043E\u0431\u044B\u0442\u0438\u0439"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "plus", onClick: () => toast("\u041D\u043E\u0432\u0430\u044F \u0431\u0430\u043D\u043A\u0435\u0442\u043D\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430", "ok", "plus") }, t("create")))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, /* @__PURE__ */ React.createElement("table", { className: "tbl", style: { tableLayout: "fixed", width: "100%", minWidth: 920 } }, /* @__PURE__ */ React.createElement("colgroup", null, /* @__PURE__ */ React.createElement("col", { style: { width: "75px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "95px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "155px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "125px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "100px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "70px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "120px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "115px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "105px" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "80px" } })), /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { paddingLeft: 18, textAlign: "left" } }, t("id")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("date")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("client")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("phone")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("kind")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", paddingRight: 16 } }, t("guests_lbl")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, t("hall_lbl")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", paddingRight: 18 } }, t("deposit")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, t("status")), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", paddingRight: 18 } }, t("actions")))), /* @__PURE__ */ React.createElement("tbody", null, filteredRows.map((b) => /* @__PURE__ */ React.createElement("tr", { key: b.id, style: { cursor: "default" } }, /* @__PURE__ */ React.createElement("td", { className: "mono dim", style: { paddingLeft: 18 } }, b.id), /* @__PURE__ */ React.createElement("td", { className: "mono", style: { whiteSpace: "nowrap" } }, b.date), /* @__PURE__ */ React.createElement("td", { style: { fontWeight: 600 }, className: "trunc" }, b.client), /* @__PURE__ */ React.createElement("td", { className: "mono dim", style: { fontSize: 11 } }, b.phone), /* @__PURE__ */ React.createElement("td", null, b.kind), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", paddingRight: 16, fontFamily: "var(--f-mono)", fontVariantNumeric: "tabular-nums", fontWeight: 600 } }, b.guests), /* @__PURE__ */ React.createElement("td", { className: "dim trunc" }, b.hall), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", paddingRight: 18, fontFamily: "var(--f-mono)", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--accent-2)" } }, summ(b.deposit), " \u0441\u0443\u043C"), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(Pill, { tone: b.status === "waiting" ? "warn" : b.status === "confirmed" ? "ok" : "muted", dot: b.status === "waiting" }, t(b.status))), /* @__PURE__ */ React.createElement("td", { style: { textAlign: "right", paddingRight: 18 } }, b.status === "waiting" ? /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "check", onClick: () => confirmBanquet(b) }, t("confirm")) : /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "ghost", icon: "more" })))), !filteredRows.length && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "10", style: { textAlign: "center", padding: "38px 12px", color: "var(--text-3)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "star", size: 24, style: { display: "block", margin: "0 auto 8px", opacity: 0.5 } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "var(--text-2)" } }, "\u0417\u0430\u044F\u0432\u043E\u043A \u043D\u0430 \u0431\u0430\u043D\u043A\u0435\u0442\u044B \u043F\u043E\u043A\u0430 \u043D\u0435\u0442"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, marginTop: 3 } }, "\u0412\u0445\u043E\u0434\u044F\u0449\u0438\u0435 \u0437\u0430\u044F\u0432\u043A\u0438 \u043D\u0430 \u0431\u0430\u043D\u043A\u0435\u0442\u044B \u0438 \u0442\u043E\u0440\u0436\u0435\u0441\u0442\u0432\u0430 \u0431\u0443\u0434\u0443\u0442 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C\u0441\u044F \u0437\u0434\u0435\u0441\u044C"))))))));
}
const FLOOR_1_TABLES = [
  { id: "T1", label: "\u0421\u0442\u043E\u043B 1", x: 8, y: 14, seats: 4, st: "free" },
  { id: "T2", label: "\u0421\u0442\u043E\u043B 2", x: 8, y: 42, seats: 4, st: "occupied" },
  { id: "T3", label: "\u0421\u0442\u043E\u043B 3", x: 8, y: 70, seats: 2, st: "booked" },
  { id: "T4", label: "\u0421\u0442\u043E\u043B 4", x: 26, y: 14, seats: 6, st: "occupied" },
  { id: "T5", label: "\u0421\u0442\u043E\u043B 5", x: 26, y: 42, seats: 4, st: "free" },
  { id: "T6", label: "\u0421\u0442\u043E\u043B 6", x: 26, y: 70, seats: 4, st: "cleaning" },
  { id: "T7", label: "\u0421\u0442\u043E\u043B 7", x: 45, y: 14, seats: 8, st: "free" },
  { id: "T8", label: "\u0421\u0442\u043E\u043B 8", x: 45, y: 42, seats: 6, st: "occupied" },
  { id: "T9", label: "\u0421\u0442\u043E\u043B 9", x: 45, y: 70, seats: 4, st: "booked" },
  { id: "T10", label: "\u0421\u0442\u043E\u043B 10", x: 64, y: 14, seats: 4, st: "free" },
  { id: "T11", label: "\u0421\u0442\u043E\u043B 11", x: 64, y: 42, seats: 6, st: "free" },
  { id: "T12", label: "\u0421\u0442\u043E\u043B 12", x: 64, y: 70, seats: 4, st: "free" },
  { id: "STAGE", label: "\u0421\u0446\u0435\u043D\u0430 & DJ", x: 83, y: 12, seats: 0, st: "special", stage: true },
  { id: "BAR", label: "\u0411\u0430\u0440\u043D\u0430\u044F \u0441\u0442\u043E\u0439\u043A\u0430", x: 83, y: 55, seats: 8, st: "occupied", bar: true }
];
const FLOOR_2_TABLES = [
  { id: "B1", label: "\u0411\u0430\u043D\u043A\u0435\u0442 \u0411-1", x: 8, y: 16, seats: 20, st: "booked", banquet: true },
  { id: "B2", label: "\u0411\u0430\u043D\u043A\u0435\u0442 \u0411-2", x: 8, y: 58, seats: 20, st: "free", banquet: true },
  { id: "B3", label: "\u0411\u0430\u043D\u043A\u0435\u0442 \u0411-3", x: 36, y: 16, seats: 24, st: "free", banquet: true },
  { id: "B4", label: "\u0411\u0430\u043D\u043A\u0435\u0442 \u0411-4", x: 36, y: 58, seats: 24, st: "occupied", banquet: true },
  { id: "B5", label: "\u0411\u0430\u043D\u043A\u0435\u0442 \u0411-5", x: 62, y: 16, seats: 16, st: "free", banquet: true },
  { id: "B6", label: "\u0411\u0430\u043D\u043A\u0435\u0442 \u0411-6", x: 62, y: 58, seats: 16, st: "cleaning", banquet: true },
  { id: "VIP1", label: "VIP 1 \u041A\u0430\u0440\u0430\u043E\u043A\u0435", x: 84, y: 10, seats: 10, st: "booked", vip: true },
  { id: "VIP2", label: "VIP 2 \u041B\u0430\u0443\u043D\u0436", x: 84, y: 42, seats: 8, st: "occupied", vip: true },
  { id: "VIP3", label: "VIP 3 \u041F\u0440\u0435\u043C\u0438\u0443\u043C", x: 84, y: 74, seats: 12, st: "free", vip: true }
];
const FLOOR_TONE = { free: "ok", occupied: "danger", booked: "warn", cleaning: "info", special: "accent" };
function Floor({ t, toast }) {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [floor1Tables, setFloor1Tables] = useState(FLOOR_1_TABLES);
  const [floor2Tables, setFloor2Tables] = useState(FLOOR_2_TABLES);
  const [sel, setSel] = useState(null);
  const [drag, setDrag] = useState(null);
  const [liveBookings, setLiveBookings] = useState([]);
  const activeTables = currentFloor === 1 ? floor1Tables : floor2Tables;
  const setActiveTables = currentFloor === 1 ? setFloor1Tables : setFloor2Tables;
  useEffect(() => {
    fetch("/api/admin/reservations").then((res) => res.json()).then((data) => {
      if (data.ok && Array.isArray(data.reservations)) {
        setLiveBookings(
          data.reservations.map((r) => ({
            id: r.id || r.code,
            time: r.res_time || "19:00",
            date: r.res_date || "",
            client: r.customer_name || "\u0413\u043E\u0441\u0442\u044C",
            phone: r.customer_phone || "",
            guests: r.guests || 2,
            zone: r.zone || "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B",
            table: r.table || r.zone || "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B",
            status: r.status || "confirmed"
          }))
        );
      }
    }).catch((err) => console.error("Floor reservations fetch error:", err));
  }, []);
  const onDrop = (e) => {
    if (!drag) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right) {
      setDrag(null);
      return;
    }
    const x = Math.round((e.clientX - rect.left) / rect.width * 100);
    const y = Math.round((e.clientY - rect.top) / rect.height * 100);
    setActiveTables((ts) => ts.map((tb) => tb.id === drag ? { ...tb, x: Math.max(0, Math.min(88, x)), y: Math.max(0, Math.min(86, y)) } : tb));
    setDrag(null);
  };
  const cycleStatus = (tbId) => {
    const cycle = { free: "occupied", occupied: "cleaning", cleaning: "booked", booked: "free", special: "special" };
    setActiveTables(
      (ts) => ts.map((tb) => {
        if (tb.id !== tbId || tb.stage) return tb;
        const nextSt = cycle[tb.st] || "free";
        toast(`\u0421\u0442\u043E\u043B ${tb.label}: \u0441\u0442\u0430\u0442\u0443\u0441 \u0438\u0437\u043C\u0435\u043D\u0451\u043D \u043D\u0430 "${t(nextSt)}"`, nextSt === "occupied" ? "warn" : "ok");
        return { ...tb, st: nextSt };
      })
    );
  };
  const selectedTable = activeTables.find((x) => x.id === sel);
  const matchingBookings = selectedTable ? liveBookings.filter((b) => {
    const lbl = selectedTable.label.toLowerCase();
    const tid = selectedTable.id.toLowerCase();
    const bTable = (b.table || "").toLowerCase();
    const bZone = (b.zone || "").toLowerCase();
    return bTable.includes(lbl) || bTable.includes(tid) || bZone.includes(lbl) || currentFloor === 2 && (bZone.includes("\u0431\u0430\u043D\u043A\u0435\u0442") || bZone.includes("vip"));
  }) : [];
  const freeCount = activeTables.filter((x) => x.st === "free" && !x.stage).length;
  const occupiedCount = activeTables.filter((x) => x.st === "occupied").length;
  const bookedCount = activeTables.filter((x) => x.st === "booked").length;
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "filters", style: { marginTop: 0, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "chip",
      "data-on": currentFloor === 1 ? "1" : "0",
      onClick: () => {
        setCurrentFloor(1);
        setSel(null);
      },
      style: { fontWeight: 700 }
    },
    "1-\u0439 \u044D\u0442\u0430\u0436 \xB7 \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B (120 \u043C\u0435\u0441\u0442)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "chip",
      "data-on": currentFloor === 2 ? "1" : "0",
      onClick: () => {
        setCurrentFloor(2);
        setSel(null);
      },
      style: { fontWeight: 700 }
    },
    "2-\u0439 \u044D\u0442\u0430\u0436 \xB7 \u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439 \u0437\u0430\u043B & VIP (170 \u043C\u0435\u0441\u0442)"
  )), /* @__PURE__ */ React.createElement("span", { className: "grow" }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center", fontSize: 11, color: "var(--text-2)" } }, /* @__PURE__ */ React.createElement("span", { className: "row", style: { gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 2, background: "var(--ok)" } }), "\u0421\u0432\u043E\u0431\u043E\u0434\u0435\u043D (", freeCount, ")"), /* @__PURE__ */ React.createElement("span", { className: "row", style: { gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 2, background: "var(--danger)" } }), "\u0417\u0430\u043D\u044F\u0442 (", occupiedCount, ")"), /* @__PURE__ */ React.createElement("span", { className: "row", style: { gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 2, background: "var(--warn)" } }), "\u0411\u0440\u043E\u043D\u044C (", bookedCount, ")"), /* @__PURE__ */ React.createElement("span", { className: "row", style: { gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: 2, background: "var(--info)" } }), "\u0423\u0431\u043E\u0440\u043A\u0430"))), /* @__PURE__ */ React.createElement("div", { className: "venue-floor-grid" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      onDragOver: (e) => e.preventDefault(),
      onDrop,
      style: {
        position: "relative",
        padding: 0,
        overflow: "hidden",
        background: "radial-gradient(circle at 50% 0%, var(--surface-2), var(--surface) 75%)",
        minHeight: 520,
        border: "1px solid var(--line)"
      }
    },
    /* @__PURE__ */ React.createElement("svg", { width: "100%", height: "100%", style: { position: "absolute", inset: 0, opacity: 0.35 } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("pattern", { id: "gridp", width: "28", height: "28", patternUnits: "userSpaceOnUse" }, /* @__PURE__ */ React.createElement("path", { d: "M28 0H0v28", fill: "none", stroke: "var(--line-soft)", strokeWidth: "1" }))), /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", fill: "url(#gridp)" })),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: 14,
          left: 18,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--accent-2)",
          display: "flex",
          alignItems: "center",
          gap: 8
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" } }),
      currentFloor === 1 ? "1-\u0439 \u044D\u0442\u0430\u0436 \xB7 \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B (120 \u043C\u0435\u0441\u0442) \xB7 \u0416\u0438\u0432\u0430\u044F \u043C\u0443\u0437\u044B\u043A\u0430 \u0438 \u0411\u0430\u0440" : "2-\u0439 \u044D\u0442\u0430\u0436 \xB7 \u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439 \u0437\u0430\u043B (170 \u043C\u0435\u0441\u0442) \xB7 \u0411\u0430\u043D\u043A\u0435\u0442\u044B \u0438 VIP-\u0437\u0430\u043B\u044B"
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9.5,
          letterSpacing: "var(--track-label)",
          textTransform: "uppercase",
          color: "var(--text-3)",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "door", size: 11 }),
      /* @__PURE__ */ React.createElement("span", null, "\u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0432\u0445\u043E\u0434 \xB7 \u0443\u043B. \u0425\u0443\u0441\u043D\u043E\u0431\u043E\u0434 5-\u0439 \u043F\u0440\u043E\u0435\u0437\u0434, 1")
    ),
    activeTables.map((tb) => {
      const isStage = !!tb.stage;
      const isVip = !!tb.vip;
      const isBanquet = !!tb.banquet;
      const isBar = !!tb.bar;
      const tone = isStage ? "var(--accent)" : "var(--" + FLOOR_TONE[tb.st] + ")";
      const on = sel === tb.id;
      const w = isStage ? 120 : isBanquet ? 116 : isBar ? 110 : isVip ? 96 : tb.seats >= 6 ? 84 : 64;
      const h = isStage ? 86 : isBanquet ? 84 : isBar ? 78 : isVip ? 80 : tb.seats >= 6 ? 74 : 64;
      const borderRadius = isStage ? "12px" : isVip ? "10px" : isBanquet ? "14px" : tb.seats >= 6 ? "12px" : "50%";
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: tb.id,
          draggable: !isStage,
          onDragStart: () => setDrag(tb.id),
          onClick: () => setSel(on ? null : tb.id),
          onDoubleClick: () => cycleStatus(tb.id),
          title: isStage ? "\u0421\u0446\u0435\u043D\u0430 \u0436\u0438\u0432\u043E\u0439 \u043C\u0443\u0437\u044B\u043A\u0438" : `${tb.label} (${tb.seats} \u043C\u0435\u0441\u0442) \u2014 \u0414\u0432\u0430\u0436\u0434\u044B \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0434\u043B\u044F \u0441\u043C\u0435\u043D\u044B \u0441\u0442\u0430\u0442\u0443\u0441\u0430`,
          style: {
            position: "absolute",
            left: `${tb.x}%`,
            top: `${tb.y}%`,
            width: w,
            height: h,
            borderRadius,
            border: "1.5px solid " + (on ? tone : isStage ? "var(--accent-line)" : "var(--line)"),
            borderLeftWidth: isVip || isBanquet ? 4 : void 0,
            borderLeftColor: isVip || isBanquet ? tone : void 0,
            backgroundColor: on ? `color-mix(in srgb, ${tone} 18%, var(--surface))` : isStage ? "rgba(211, 170, 99, 0.08)" : "var(--surface)",
            color: "var(--text)",
            cursor: isStage ? "default" : "grab",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            boxShadow: on ? `0 0 0 3px color-mix(in srgb, ${tone} 25%, transparent)` : "var(--shadow)",
            transition: "all .16s var(--ease)",
            fontFamily: "var(--f-body)",
            zIndex: on ? 10 : 2
          }
        },
        isStage ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "music", size: 18, style: { color: "var(--accent-2)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "var(--accent-2)", marginTop: 2 } }, "\u0421\u0446\u0435\u043D\u0430 & DJ"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8.5, color: "var(--text-3)" } }, "\u0416\u0438\u0432\u043E\u0439 \u0437\u0432\u0443\u043A")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
          "span",
          {
            style: {
              fontSize: isBanquet || isVip || isBar ? 11 : 13,
              fontWeight: 700,
              fontFamily: "var(--f-body)",
              letterSpacing: isVip ? ".03em" : 0
            }
          },
          tb.label
        ), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3 } }, /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 8.5 }), " ", tb.seats, " \u043C\u0435\u0441\u0442"), /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: tone, marginTop: 1 } }))
      );
    })
  ), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 14, overflowY: "auto", display: "flex", flexDirection: "column" } }, selectedTable ? /* @__PURE__ */ React.createElement("div", { className: "col-flex", style: { gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, currentFloor === 1 ? "1-\u0439 \u044D\u0442\u0430\u0436 \xB7 \u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0437\u0430\u043B" : "2-\u0439 \u044D\u0442\u0430\u0436 \xB7 \u0411\u0430\u043D\u043A\u0435\u0442\u043D\u044B\u0439 \u0437\u0430\u043B"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--f-body)", fontSize: 18, fontWeight: 700, lineHeight: 1.1, marginTop: 3 } }, selectedTable.label), !selectedTable.stage && /* @__PURE__ */ React.createElement("div", { className: "row", style: { marginTop: 8, gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Pill, { tone: FLOOR_TONE[selectedTable.st], dot: true }, t(selectedTable.st === "free" ? "free" : selectedTable.st === "booked" ? "booked" : selectedTable.st === "occupied" ? "occupied" : selectedTable.st === "cleaning" ? "cleaning" : "ok")), /* @__PURE__ */ React.createElement(Pill, { tone: "muted" }, /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 10 }), " \u0412\u043C\u0435\u0441\u0442\u0438\u043C\u043E\u0441\u0442\u044C: ", selectedTable.seats, " \u0433\u043E\u0441\u0442\u0435\u0439"))), !selectedTable.stage && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "sect-title", style: { margin: 0 } }, "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u0442\u043E\u043B\u043E\u043C"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement(
    Btn,
    {
      icon: "users",
      variant: "accent",
      onClick: () => {
        setActiveTables((ts) => ts.map((x) => x.id === selectedTable.id ? { ...x, st: "occupied" } : x));
        toast(`\u0413\u043E\u0441\u0442\u0438 \u043F\u043E\u0441\u0430\u0436\u0435\u043D\u044B \u0437\u0430 "${selectedTable.label}"`, "ok", "check");
      }
    },
    "\u041F\u043E\u0441\u0430\u0434\u0438\u0442\u044C \u0433\u043E\u0441\u0442\u0435\u0439 (\u0417\u0430\u043D\u044F\u0442)"
  ), /* @__PURE__ */ React.createElement(
    Btn,
    {
      icon: "check",
      onClick: () => {
        setActiveTables((ts) => ts.map((x) => x.id === selectedTable.id ? { ...x, st: "free" } : x));
        toast(`\u0421\u0442\u043E\u043B "${selectedTable.label}" \u043E\u0441\u0432\u043E\u0431\u043E\u0436\u0434\u0451\u043D`, "ok", "check");
      }
    },
    "\u041E\u0441\u0432\u043E\u0431\u043E\u0434\u0438\u0442\u044C \u0441\u0442\u043E\u043B (\u0421\u0432\u043E\u0431\u043E\u0434\u0435\u043D)"
  ), /* @__PURE__ */ React.createElement(
    Btn,
    {
      icon: "rotate",
      variant: "ghost",
      onClick: () => cycleStatus(selectedTable.id)
    },
    "\u0421\u043C\u0435\u043D\u0438\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441 (\u0423\u0431\u043E\u0440\u043A\u0430/\u0411\u0440\u043E\u043D\u044C)"
  )), /* @__PURE__ */ React.createElement("div", { style: { paddingTop: 10, borderTop: "1px solid var(--line-soft)" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "\u0411\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0438\u0437 \u0431\u0430\u0437\u044B \u0434\u0430\u043D\u043D\u044B\u0445"), /* @__PURE__ */ React.createElement("div", { className: "col-flex", style: { marginTop: 8, gap: 8 } }, matchingBookings.slice(0, 3).map((b) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: b.id,
      style: {
        background: "var(--surface-2)",
        borderRadius: "8px",
        padding: "8px 10px",
        border: "1px solid var(--line-soft)",
        display: "flex",
        flexDirection: "column",
        gap: 3
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, fontSize: 12 } }, b.client), /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontSize: 11, color: "var(--accent-2)", fontWeight: 700 } }, b.time)),
    b.phone && /* @__PURE__ */ React.createElement("div", { className: "mono dim", style: { fontSize: 10.5, display: "flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement(Icon, { name: "phone", size: 10 }), " ", b.phone),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-3)" } }, /* @__PURE__ */ React.createElement("span", null, "\u0413\u043E\u0441\u0442\u0435\u0439: ", b.guests, " \u0447\u0435\u043B."), /* @__PURE__ */ React.createElement("span", null, b.date || "\u0421\u0435\u0433\u043E\u0434\u043D\u044F"))
  )), !matchingBookings.length && /* @__PURE__ */ React.createElement("div", { style: { padding: "14px 8px", textAlign: "center", color: "var(--text-3)", fontSize: 11 } }, "\u041D\u0430 \u044D\u0442\u043E\u0442 \u0441\u0442\u043E\u043B \u043D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0431\u0440\u043E\u043D\u0435\u0439"))))) : /* @__PURE__ */ React.createElement("div", { className: "empty", style: { height: "100%", padding: "40px 10px" } }, /* @__PURE__ */ React.createElement(Icon, { name: "grid", size: 26 }), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, marginTop: 8 } }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u043E\u043B"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "var(--text-3)", textAlign: "center", marginTop: 4 } }, "\u041A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u043B\u044E\u0431\u043E\u043C\u0443 \u0441\u0442\u043E\u043B\u0443 \u0438\u043B\u0438 VIP-\u0437\u0430\u043B\u0443 \u043D\u0430 \u043F\u043B\u0430\u043D\u0435 \u0434\u043B\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0443\u0441\u043E\u043C \u043F\u043E\u0441\u0430\u0434\u043A\u0438")))));
}
Object.assign(window, { Bookings, Banquets, Floor, BOOK_TONE });
const TASHKENT_DISTRICT_COORDS = {
  yashnabad: [41.2858, 69.3402],
  // FENIX Restobar Hub
  mirabad: [41.2985, 69.2789],
  chilanzar: [41.2721, 69.2045],
  yunusabad: [41.3645, 69.2885],
  sergeli: [41.2215, 69.2205],
  shaykhontohur: [41.3255, 69.2395],
  mirzoulugbek: [41.3325, 69.3385],
  olmazar: [41.3515, 69.2215],
  uchtepa: [41.2925, 69.1765],
  center: [41.3111, 69.2797]
};
function getCoordsForAddress(addr) {
  const str = String(addr || "");
  const match = str.match(/([0-9]{2}\.[0-9]+)[\s,]+([0-9]{2}\.[0-9]+)/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (lat > 40 && lat < 43 && lon > 68 && lon < 71) {
      return [lat, lon];
    }
  }
  const s = str.toLowerCase();
  if (s.includes("\u0447\u0438\u043B\u0430\u043D\u0437\u0430\u0440") || s.includes("chilonzor")) return TASHKENT_DISTRICT_COORDS.chilanzar;
  if (s.includes("\u044E\u043D\u0443\u0441\u0430\u0431\u0430\u0434") || s.includes("yunusobod")) return TASHKENT_DISTRICT_COORDS.yunusabad;
  if (s.includes("\u043C\u0438\u0440\u0430\u0431\u0430\u0434") || s.includes("mirobod")) return TASHKENT_DISTRICT_COORDS.mirabad;
  if (s.includes("\u0441\u0435\u0440\u0433\u0435\u043B\u0438") || s.includes("sergeli")) return TASHKENT_DISTRICT_COORDS.sergeli;
  if (s.includes("\u0448\u0430\u0439\u0445\u0430\u043D\u0442\u0430\u0445\u0443\u0440") || s.includes("shayxontohur")) return TASHKENT_DISTRICT_COORDS.shaykhontohur;
  if (s.includes("\u0443\u043B\u0443\u0433\u0431\u0435\u043A") || s.includes("ulug")) return TASHKENT_DISTRICT_COORDS.mirzoulugbek;
  if (s.includes("\u044F\u0448\u043D\u0430\u0431\u0430\u0434") || s.includes("yashnobod") || s.includes("\u0445\u0443\u0441\u043D\u043E\u0431\u043E\u0434")) return [41.289, 69.335];
  const hash = s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const latOffset = (hash % 100 - 50) * 8e-4;
  const lngOffset = (hash * 7 % 100 - 50) * 1e-3;
  return [41.3111 + latOffset, 69.2797 + lngOffset];
}
function Couriers({ t, toast, orders = [] }) {
  const deliveryOrders = orders.filter((o) => o.type === "delivery");
  const [selId, setSelId] = useState(null);
  const [filterMode, setFilterMode] = useState("active");
  const [couriersList, setCouriersList] = useState([]);
  const [courierGroupInfo, setCourierGroupInfo] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState("group");
  const [refreshTick, setRefreshTick] = useState(0);
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const markersRef = useRef([]);
  const lastPannedIdRef = useRef(null);
  useEffect(() => {
    fetch("/api/admin/couriers").then((r) => r.json()).then((res) => {
      if (res && res.ok) {
        if (Array.isArray(res.couriers)) setCouriersList(res.couriers);
        if (res.courierGroup) setCourierGroupInfo(res.courierGroup);
        setSelectedCourier("group");
      }
    }).catch(() => {
    });
  }, []);
  const activeDeliveries = deliveryOrders.filter((o) => o.col !== "done");
  const completedDeliveries = deliveryOrders.filter((o) => o.col === "done");
  const displayedOrders = filterMode === "active" ? activeDeliveries : deliveryOrders;
  const currentOrder = deliveryOrders.find((o) => o.id === selId) || displayedOrders[0] || deliveryOrders[0];
  useEffect(() => {
    if (typeof window === "undefined" || !window.L || !mapRef.current) return;
    if (!leafletInstance.current) {
      const map2 = window.L.map(mapRef.current, {
        center: [41.2995, 69.3],
        zoom: 12,
        zoomControl: true
      });
      window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
        className: "fenix-dark-map-tiles"
      }).addTo(map2);
      const fenixIcon = window.L.divIcon({
        className: "fenix-map-pin",
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
        iconAnchor: [19, 19]
      });
      window.L.marker(TASHKENT_DISTRICT_COORDS.yashnabad, { icon: fenixIcon }).addTo(map2).bindPopup(`
          <div style="font-family: sans-serif; color: #111; padding: 4px;">
            <b style="color: #b8860b;">FENIX Restobar & Lounge</b><br/>
            <span>\u042F\u0448\u043D\u0430\u0431\u0430\u0434\u0441\u043A\u0438\u0439 \u0440\u0430\u0439\u043E\u043D, 5-\u0439 \u043F\u0440\u043E\u0435\u0437\u0434 \u0425\u0443\u0441\u043D\u043E\u0431\u043E\u0434, 1</span><br/>
            <small style="color: #666;">\u0426\u0435\u043D\u0442\u0440 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u0437\u0430\u043A\u0430\u0437\u043E\u0432</small>
          </div>
        `);
      leafletInstance.current = map2;
    }
    const map = leafletInstance.current;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    deliveryOrders.forEach((ord) => {
      const coords = getCoordsForAddress(ord.addr);
      const isSel = currentOrder && currentOrder.id === ord.id;
      const isDone = ord.col === "done";
      const orderIcon = window.L.divIcon({
        className: "order-map-pin",
        html: `
          <div style="
            width: ${isSel ? 36 : 28}px; height: ${isSel ? 36 : 28}px; border-radius: 50%;
            background: ${isDone ? "#57a877" : isSel ? "#d3aa63" : "#4a7fc1"};
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
        iconAnchor: [isSel ? 18 : 14, isSel ? 18 : 14]
      });
      const marker = window.L.marker(coords, { icon: orderIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #111; padding: 4px; min-width: 170px;">
          <b style="color: #d3aa63;">\u0417\u0430\u043A\u0430\u0437 #${ord.id}</b><br/>
          <b>${ord.client || "\u041A\u043B\u0438\u0435\u043D\u0442"}</b> \xB7 ${ord.phone || "\u2014"}<br/>
          <span style="font-size: 11px; color: #444;">${ord.addr || "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438"}</span><br/>
          <b>${summ(ord.total)} \u0441\u0443\u043C</b>
        </div>
      `);
      marker.on("click", () => setSelId(ord.id));
      markersRef.current.push(marker);
    });
    if (selId && selId !== lastPannedIdRef.current) {
      lastPannedIdRef.current = selId;
      const target = deliveryOrders.find((o) => o.id === selId);
      if (target && target.addr) {
        const targetCoords = getCoordsForAddress(target.addr);
        map.flyTo(targetCoords, Math.max(map.getZoom(), 14), { duration: 0.8 });
      }
    } else if (!lastPannedIdRef.current && currentOrder && currentOrder.addr) {
      lastPannedIdRef.current = currentOrder.id;
      const targetCoords = getCoordsForAddress(currentOrder.addr);
      map.setView(targetCoords, 13);
    }
  }, [deliveryOrders, selId, currentOrder]);
  const advanceDeliveryStatus = async (ord, nextCol, nextRu) => {
    try {
      await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ord.dbId,
          orderNum: ord.orderNum || parseInt(String(ord.id).replace(/\D/g, "")),
          status: nextRu
        })
      });
      ord.col = nextCol;
      setRefreshTick((v) => v + 1);
      toast(`\u0417\u0430\u043A\u0430\u0437 #${ord.id} \u043F\u0435\u0440\u0435\u0432\u0435\u0434\u0451\u043D \u0432 \u0441\u0442\u0430\u0442\u0443\u0441 "${nextRu}"`, "ok", "check");
    } catch (e) {
      toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0443\u0441\u0430: " + e.message, "err");
    }
  };
  const dispatchToCourierTelegram = async (ord) => {
    try {
      const isGroup = selectedCourier === "group";
      const courier = isGroup ? null : couriersList.find((c) => String(c.user_id) === String(selectedCourier));
      const res = await fetch("/api/admin/orders/dispatch-courier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ord.dbId,
          orderNum: ord.orderNum || parseInt(String(ord.id).replace(/\D/g, "")),
          courierId: selectedCourier,
          courierName: isGroup ? courierGroupInfo?.title || "\u0413\u0440\u0443\u043F\u043F\u0430 \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u0432" : courier ? courier.full_name : "\u041A\u0443\u0440\u044C\u0435\u0440 Fenix"
        })
      });
      const data = await res.json();
      if (data.ok) {
        ord.col = "way";
        setRefreshTick((v) => v + 1);
        const targetDesc = isGroup ? "\u0432 \u0433\u0440\u0443\u043F\u043F\u0443 \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u0432 FENIX" : `\u043A\u0443\u0440\u044C\u0435\u0440\u0443 ${courier ? courier.full_name : ""}`;
        toast(`\u0417\u0430\u043A\u0430\u0437 #${ord.id} \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D ${targetDesc}!`, "ok", "truck");
      }
    } catch (e) {
      toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u043A\u0443\u0440\u044C\u0435\u0440\u0443: " + e.message, "err");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "kpis" }, [
    { l: "\u0412\u0441\u0435\u0433\u043E \u0434\u043E\u0441\u0442\u0430\u0432\u043E\u043A", v: deliveryOrders.length, f: "\u0417\u0430\u043A\u0430\u0437\u043E\u0432 \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u043C \u0438\u0437 \u0431\u0430\u0437\u044B", icon: "truck" },
    { l: "\u0412 \u043F\u0443\u0442\u0438 \u043A \u043A\u043B\u0438\u0435\u043D\u0442\u0443", v: deliveryOrders.filter((o) => o.col === "way").length, f: "\u041F\u0435\u0440\u0435\u0434\u0430\u043D\u043E \u043A\u0443\u0440\u044C\u0435\u0440\u0443", icon: "bike", warn: true },
    { l: "\u0423\u0441\u043F\u0435\u0448\u043D\u043E \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E", v: completedDeliveries.length, f: "\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u044B", icon: "check" },
    { l: "\u0411\u0430\u0437\u0430 Fenix Hub", v: "\u042F\u0448\u043D\u0430\u0431\u0430\u0434", f: "\u0443\u043B. \u0425\u0443\u0441\u043D\u043E\u0431\u043E\u0434 5-\u0439 \u043F\u0440\u043E\u0435\u0437\u0434, 1", icon: "pin" }
  ].map((c) => /* @__PURE__ */ React.createElement("div", { className: "card kpi", key: c.l }, /* @__PURE__ */ React.createElement("div", { className: "kpi-top" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, c.l), /* @__PURE__ */ React.createElement("span", { className: "kpi-ico", style: c.warn ? { color: "var(--warn)", background: "var(--warn-soft)" } : void 0 }, /* @__PURE__ */ React.createElement(Icon, { name: c.icon, size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("div", { className: "stat-num" }, c.v)), /* @__PURE__ */ React.createElement("div", { className: "kpi-foot" }, /* @__PURE__ */ React.createElement("span", { className: "trunc" }, c.f))))), /* @__PURE__ */ React.createElement("div", { className: "couriers-layout" }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { position: "relative", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: 12,
    left: 14,
    zIndex: 999,
    background: "rgba(18, 17, 13, 0.88)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--line-strong)",
    borderRadius: "10px",
    padding: "8px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10
  } }, /* @__PURE__ */ React.createElement("span", { style: { width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" } }, "\u0422\u0430\u0448\u043A\u0435\u043D\u0442 \xB7 \u041A\u0430\u0440\u0442\u0430 \u043B\u043E\u0433\u0438\u0441\u0442\u0438\u043A\u0438 Fenix"), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      title: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C Fenix Hub \u0438 \u0432\u0441\u0435 \u0442\u043E\u0447\u043A\u0438 \u0434\u043E\u0441\u0442\u0430\u0432\u043E\u043A \u043D\u0430 \u043E\u0434\u043D\u043E\u0439 \u043A\u0430\u0440\u0442\u0435",
      onClick: () => {
        if (leafletInstance.current && markersRef.current.length) {
          const group = window.L.featureGroup([
            window.L.marker(TASHKENT_DISTRICT_COORDS.yashnabad),
            ...markersRef.current
          ]);
          leafletInstance.current.fitBounds(group.getBounds().pad(0.2));
        }
      },
      style: {
        marginLeft: 6,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid var(--line)",
        borderRadius: "6px",
        color: "var(--ink)",
        padding: "3px 9px",
        fontSize: 10.5,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease"
      }
    },
    "\u041E\u0431\u0437\u043E\u0440 \u0433\u043E\u0440\u043E\u0434\u0430"
  )), /* @__PURE__ */ React.createElement("div", { ref: mapRef, style: { width: "100%", height: "100%", minHeight: 480, background: "#0b0a08" } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    bottom: 12,
    left: 14,
    zIndex: 999,
    background: "rgba(18, 17, 13, 0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--line)",
    borderRadius: "8px",
    padding: "6px 12px",
    display: "flex",
    gap: 14,
    fontSize: 11
  } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: "#d3aa63" } }), " FENIX Hub"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: "#4a7fc1" } }), " \u041D\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0435"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: "#57a877" } }), " \u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { className: "label", style: { margin: 0 } }, "\u0417\u0430\u043A\u0430\u0437\u044B:"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "chip",
      "data-on": filterMode === "active" ? "1" : "0",
      onClick: () => setFilterMode("active")
    },
    "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 (",
    activeDeliveries.length,
    ")"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "chip",
      "data-on": filterMode === "all" ? "1" : "0",
      onClick: () => setFilterMode("all")
    },
    "\u0412\u0441\u0435 (",
    deliveryOrders.length,
    ")"
  )), currentOrder ? /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 14, border: "1px solid var(--line-strong)", background: "var(--surface-2)" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0437"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 700, fontFamily: "var(--f-mono)", color: "var(--accent-2)" } }, "#", currentOrder.id)), /* @__PURE__ */ React.createElement(Pill, { tone: currentOrder.col === "done" ? "ok" : currentOrder.col === "way" ? "info" : "warn" }, currentOrder.col === "done" ? "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D" : currentOrder.col === "way" ? "\u0412 \u043F\u0443\u0442\u0438" : "\u041A\u0443\u0445\u043D\u044F \u0433\u043E\u0442\u043E\u0432\u0438\u0442")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.6, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "\u041A\u043B\u0438\u0435\u043D\u0442:"), " ", currentOrder.client), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, "\u0422\u0435\u043B\u0435\u0444\u043E\u043D:"), " ", /* @__PURE__ */ React.createElement("a", { href: `tel:${currentOrder.phone}`, style: { color: "var(--accent)", textDecoration: "none" } }, currentOrder.phone)), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, padding: "6px 8px", background: "var(--surface)", borderRadius: "6px", border: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("b", null, "\u0410\u0434\u0440\u0435\u0441:"), " ", currentOrder.addr || "\u0422\u0430\u0448\u043A\u0435\u043D\u0442"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6 } }, /* @__PURE__ */ React.createElement("b", null, "\u0421\u0443\u043C\u043C\u0430:"), " ", /* @__PURE__ */ React.createElement("span", { className: "mono", style: { color: "var(--accent-2)", fontWeight: 700 } }, summ(currentOrder.total), " \u0441\u0443\u043C"), /* @__PURE__ */ React.createElement("span", { className: "dim", style: { marginLeft: 8 } }, "(", currentOrder.pay === "cash" ? "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u043C\u0438" : "\u041A\u0430\u0440\u0442\u043E\u0439", ")")), currentOrder.courier && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, padding: "5px 8px", background: "var(--surface)", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, color: "var(--accent-2)", fontWeight: 600, fontSize: 12, border: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "bike", size: 13 }), " \u041A\u0443\u0440\u044C\u0435\u0440: ", currentOrder.courier)), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4, marginBottom: 10, padding: "8px 10px", background: "var(--surface-3)", borderRadius: 8, border: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("div", { className: "label", style: { marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement(Icon, { name: "bike", size: 12 }), " \u041D\u0430\u0437\u043D\u0430\u0447\u0438\u0442\u044C \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0443 (Telegram):"), courierGroupInfo?.configured ? /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ok)", fontSize: 10, display: "flex", alignItems: "center", gap: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: "var(--ok)" } }), " \u0413\u0440\u0443\u043F\u043F\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430") : /* @__PURE__ */ React.createElement("span", { style: { color: "var(--dim)", fontSize: 10 } }, "/set_courier_group \u0432 \u0447\u0430\u0442\u0435")), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedCourier,
      onChange: (e) => setSelectedCourier(e.target.value),
      style: {
        width: "100%",
        height: 32,
        borderRadius: 6,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--text)",
        fontSize: 12,
        padding: "0 8px",
        outline: "none"
      }
    },
    /* @__PURE__ */ React.createElement("option", { value: "group" }, courierGroupInfo?.configured ? `\u0413\u0440\u0443\u043F\u043F\u0430 \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u0432 (${courierGroupInfo.title || "\u0412\u0437\u044F\u0442\u044C \u0437\u0430\u043A\u0430\u0437"})` : "\u041E\u0431\u0449\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430 \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u0432 (\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0440\u0430\u0437\u0431\u043E\u0440)"),
    couriersList.map((c) => /* @__PURE__ */ React.createElement("option", { key: c.user_id, value: c.user_id }, c.full_name, " (", c.role === "courier" ? "\u041A\u0443\u0440\u044C\u0435\u0440" : c.role, ")"))
  )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7 } }, selectedCourier !== "group" ? /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "bike", onClick: () => dispatchToCourierTelegram(currentOrder) }, currentOrder.col === "way" || currentOrder.col === "done" ? `\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043A\u0443\u0440\u044C\u0435\u0440\u0443 (${couriersList.find((c) => String(c.user_id) === String(selectedCourier))?.full_name || "\u041A\u0443\u0440\u044C\u0435\u0440"}) \u0432 Telegram` : `\u041D\u0430\u0437\u043D\u0430\u0447\u0438\u0442\u044C \u043A\u0443\u0440\u044C\u0435\u0440\u0443 (${couriersList.find((c) => String(c.user_id) === String(selectedCourier))?.full_name || "\u041A\u0443\u0440\u044C\u0435\u0440"}) \u0432 Telegram`) : currentOrder.col !== "way" && currentOrder.col !== "done" ? /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "bike", onClick: () => dispatchToCourierTelegram(currentOrder) }, "\u041F\u0435\u0440\u0435\u0434\u0430\u0442\u044C \u0432 \u043E\u0431\u0449\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u0432 (Telegram)") : /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "ghost", icon: "bike", onClick: () => dispatchToCourierTelegram(currentOrder) }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E \u0432 \u0433\u0440\u0443\u043F\u043F\u0443 \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u0432"), currentOrder.col === "way" && /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "check", onClick: () => advanceDeliveryStatus(currentOrder, "done", "\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D") }, "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0443 \u043A\u043B\u0438\u0435\u043D\u0442\u0443"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `https://yandex.uz/maps/?rtext=41.2858,69.3402~${getCoordsForAddress(currentOrder.addr)[0]},${getCoordsForAddress(currentOrder.addr)[1]}&rtt=auto`,
      target: "_blank",
      rel: "noreferrer",
      className: "btn btn-sm",
      style: { textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "var(--surface-3)" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "pin", size: 13 }),
    " \u042F\u043D\u0434\u0435\u043A\u0441 \u041A\u0430\u0440\u0442\u044B"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `yandexnavi://build_route_on_map?lat_to=${getCoordsForAddress(currentOrder.addr)[0]}&lon_to=${getCoordsForAddress(currentOrder.addr)[1]}`,
      className: "btn btn-sm",
      title: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u042F\u043D\u0434\u0435\u043A\u0441.\u041D\u0430\u0432\u0438\u0433\u0430\u0442\u043E\u0440",
      style: { textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "var(--surface-3)" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "pin", size: 13 }),
    " \u041D\u0430\u0432\u0438\u0433\u0430\u0442\u043E\u0440"
  )), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `tel:${currentOrder.phone}`,
      className: "btn btn-sm",
      style: { textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "var(--surface-3)" }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "phone", size: 13 }),
    " \u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C \u043A\u043B\u0438\u0435\u043D\u0442\u0443"
  ))) : null, /* @__PURE__ */ React.createElement("div", { className: "card", style: { flex: 1, padding: "10px 12px", overflowY: "auto", maxHeight: "340px" } }, /* @__PURE__ */ React.createElement("div", { className: "label", style: { marginBottom: 8 } }, "\u0421\u043F\u0438\u0441\u043E\u043A \u0434\u043E\u0441\u0442\u0430\u0432\u043E\u043A (", displayedOrders.length, ")"), displayedOrders.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "empty", style: { padding: "24px 12px", textAlign: "center", fontSize: 12, color: "var(--text-3)" } }, "\u041D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u0432 \u044D\u0442\u043E\u0439 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438") : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, displayedOrders.map((o) => {
    const isSel = currentOrder && currentOrder.id === o.id;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: o.id,
        onClick: () => setSelId(o.id),
        style: {
          padding: "9px 10px",
          borderRadius: "8px",
          border: "1px solid " + (isSel ? "var(--accent)" : "var(--line)"),
          background: isSel ? "var(--accent-soft)" : "var(--surface)",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 3
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { className: "mono", style: { fontWeight: 700, fontSize: 12, color: isSel ? "var(--accent-2)" : "var(--text)" } }, "#", o.id), /* @__PURE__ */ React.createElement(Pill, { tone: o.col === "done" ? "ok" : o.col === "way" ? "info" : "warn" }, o.col === "done" ? "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D" : o.col === "way" ? "\u0412 \u043F\u0443\u0442\u0438" : "\u041A\u0443\u0445\u043D\u044F")),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-2)" }, className: "trunc" }, o.client, " \xB7 ", o.courier ? `\u041A\u0443\u0440\u044C\u0435\u0440: ${o.courier}` : o.addr || "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438"),
      /* @__PURE__ */ React.createElement("div", { className: "mono", style: { fontSize: 11, color: "var(--accent)", fontWeight: 600 } }, summ(o.total), " \u0441\u0443\u043C")
    );
  }))))));
}
function MenuScreen({ t, toast }) {
  const [data, setData] = useState(FX.menu);
  const [openCats, setOpenCats] = useState({});
  const [search, setSearch] = useState("");
  const [activeCuisine, setActiveCuisine] = useState("all");
  const [editDish, setEditDish] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDishData, setNewDishData] = useState({
    name: "",
    nameUz: "",
    nameEn: "",
    cuisine: "europe",
    category: "starters",
    price: "",
    size: "",
    note: ""
  });
  useEffect(() => {
    fetch("/api/admin/menu/stoplist").then((r) => r.json()).then((res) => {
      if (res && res.ok && Array.isArray(res.stopped)) {
        const stopSet = new Set(res.stopped.map((s) => String(s).toLowerCase().trim()));
        setData(
          (prev) => prev.map((c) => ({
            ...c,
            items: c.items.map((it) => {
              const isStop = stopSet.has(String(it.n).toLowerCase().trim());
              return { ...it, on: !isStop, stop: isStop };
            })
          }))
        );
      }
    }).catch(() => {
    });
  }, []);
  useEffect(() => {
    const o = {};
    data.forEach((c) => {
      o[c.cat] = true;
    });
    setOpenCats(o);
  }, [data.length]);
  const toggleStopList = (catName, dishIndex, dish) => {
    const willStop = dish.on;
    setData(
      (d) => d.map((c) => {
        if (c.cat !== catName) return c;
        return {
          ...c,
          items: c.items.map((it, j) => {
            if (j !== dishIndex) return it;
            return { ...it, on: !willStop, stop: willStop };
          })
        };
      })
    );
    toast(
      willStop ? `"${dish.n}" \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u0441\u0442\u043E\u043F-\u043B\u0438\u0441\u0442 \u043A\u0443\u0445\u043D\u0438` : `"${dish.n}" \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0451\u043D \u0432 \u043C\u0435\u043D\u044E`,
      willStop ? "warn" : "ok",
      willStop ? "alert" : "check"
    );
    fetch("/api/admin/menu/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: dish.n, stop: willStop })
    }).catch(() => {
    });
  };
  const handleSavePrice = () => {
    if (!editDish || !newPrice) return;
    const priceNum = parseInt(String(newPrice).replace(/\D/g, ""), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0443\u044E \u0441\u0443\u043C\u043C\u0443", "err");
      return;
    }
    setData(
      (d) => d.map((c) => ({
        ...c,
        items: c.items.map((it) => it.n === editDish.n ? { ...it, p: priceNum } : it)
      }))
    );
    fetch("/api/admin/menu/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editDish.id, name: editDish.n, price: priceNum })
    }).catch(() => {
    });
    toast(`\u0426\u0435\u043D\u0430 "${editDish.n}" \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0430: ${summ(priceNum)} \u0441\u0443\u043C`, "ok", "check");
    setEditDish(null);
  };
  const handleDeleteDish = async (dish) => {
    if (!dish) return;
    if (!window.confirm(`\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0431\u043B\u044E\u0434\u043E "${dish.n}" \u0438\u0437 \u043C\u0435\u043D\u044E?`)) return;
    try {
      const res = await fetch("/api/admin/menu/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dish.id, name: dish.n })
      });
      const dataRes = await res.json();
      if (dataRes && dataRes.ok) {
        setData(
          (prev) => prev.map((c) => ({
            ...c,
            items: c.items.filter((it) => it.id !== dish.id && it.n !== dish.n)
          })).filter((c) => c.items.length > 0)
        );
        toast(`\u0411\u043B\u044E\u0434\u043E "${dish.n}" \u0443\u0434\u0430\u043B\u0435\u043D\u043E \u0438\u0437 \u043C\u0435\u043D\u044E`, "ok", "trash");
        setEditDish(null);
      } else {
        toast(dataRes?.error || "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0438 \u0431\u043B\u044E\u0434\u0430", "err");
      }
    } catch (err) {
      toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C", "err");
    }
  };
  const handleCreateDish = async () => {
    if (!newDishData.name || !newDishData.price) {
      toast("\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438 \u0446\u0435\u043D\u0443 \u0431\u043B\u044E\u0434\u0430", "err");
      return;
    }
    const priceNum = parseInt(String(newDishData.price).replace(/\D/g, ""), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0443\u044E \u0441\u0443\u043C\u043C\u0443", "err");
      return;
    }
    try {
      const res = await fetch("/api/admin/menu/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        toast(`\u0411\u043B\u044E\u0434\u043E "${newDishData.name}" \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0432 \u043C\u0435\u043D\u044E!`, "ok", "check");
        setIsAddModalOpen(false);
        const addedName = newDishData.name;
        const addedUz = newDishData.nameUz;
        const addedEn = newDishData.nameEn;
        const cuisineLabel = newDishData.cuisine === "europe" ? "\u0415\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u0430\u044F \u043A\u0443\u0445\u043D\u044F" : newDishData.cuisine === "korea" ? "\u041A\u043E\u0440\u0435\u0439\u0441\u043A\u0430\u044F \u043A\u0443\u0445\u043D\u044F" : "\u0411\u0430\u0440\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430";
        const catMap = {
          starters: "\u0417\u0430\u043A\u0443\u0441\u043A\u0438",
          salads: "\u0421\u0430\u043B\u0430\u0442\u044B",
          soups: "\u041F\u0435\u0440\u0432\u044B\u0435 \u0431\u043B\u044E\u0434\u0430",
          mains: "\u0412\u0442\u043E\u0440\u044B\u0435 \u0431\u043B\u044E\u0434\u0430",
          kebabs: "\u0428\u0430\u0448\u043B\u044B\u043A\u0438 \u043A\u0430\u0432\u043A\u0430\u0437\u0441\u043A\u0438\u0435",
          "mini-kebabs": "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u0448\u0430\u0448\u043B\u044B\u043A\u0438",
          fish: "\u0420\u044B\u0431\u043D\u044B\u0435",
          "grilled-veg": "\u041E\u0432\u043E\u0449\u043D\u044B\u0435",
          sides: "\u0413\u0430\u0440\u043D\u0438\u0440\u044B",
          bread: "\u0425\u043B\u0435\u0431\u0430",
          soft: "\u041D\u0430\u043F\u0438\u0442\u043A\u0438",
          flour: "\u041C\u0443\u0447\u043D\u044B\u0435 \u0438\u0437\u0434\u0435\u043B\u0438\u044F",
          tea: "\u0427\u0430\u0439",
          cocktails: "\u041A\u043E\u043A\u0442\u0435\u0439\u043B\u0438",
          lemonades: "\u041B\u0438\u043C\u043E\u043D\u0430\u0434\u044B",
          coffee: "\u041A\u043E\u0444\u0435",
          whisky: "\u0412\u0438\u0441\u043A\u0438",
          vodka: "\u0412\u043E\u0434\u043A\u0430",
          beer: "\u041F\u0438\u0432\u043E",
          tequila: "\u0422\u0435\u043A\u0438\u043B\u0430",
          rum: "\u0420\u043E\u043C",
          cognac: "\u041A\u043E\u043D\u044C\u044F\u043A",
          wine: "\u0412\u0438\u043D\u043E",
          snacks: "\u0421\u043D\u0435\u043A\u0438"
        };
        const secRu = catMap[newDishData.category] || "\u0414\u0440\u0443\u0433\u043E\u0435";
        const groupKey = `${cuisineLabel} \xB7 ${secRu}`;
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
            return prev.map((c) => c.cat === groupKey ? { ...c, items: [newDishObj, ...c.items] } : c);
          }
          return [{ cat: groupKey, section: secRu, cuisine: cuisineLabel, menuType: newDishData.cuisine, items: [newDishObj] }, ...prev];
        });
        setActiveCuisine(newDishData.cuisine);
        setNewDishData({
          name: "",
          nameUz: "",
          nameEn: "",
          cuisine: "europe",
          category: "starters",
          price: "",
          size: "",
          note: ""
        });
      } else {
        toast(dataRes?.error || "\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u0438\u0438 \u0431\u043B\u044E\u0434\u0430", "err");
      }
    } catch (err) {
      toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C", "err");
    }
  };
  const allDishes = data.flatMap((c) => c.items);
  const totalCount = allDishes.length;
  const inStockCount = allDishes.filter((i) => i.on).length;
  const stoppedCount = totalCount - inStockCount;
  const filteredCategories = data.filter((c) => {
    if (activeCuisine === "europe" && c.menuType !== "europe") return false;
    if (activeCuisine === "korea" && c.menuType !== "korea") return false;
    if (activeCuisine === "bar" && c.menuType !== "bar") return false;
    return true;
  }).map((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return c;
    const matched = c.items.filter(
      (it) => it.n.toLowerCase().includes(q) || it.nUz && it.nUz.toLowerCase().includes(q) || it.nEn && it.nEn.toLowerCase().includes(q)
    );
    return { ...c, items: matched };
  }).filter((c) => c.items.length > 0);
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "kpis" }, [
    { l: "\u0412\u0441\u0435\u0433\u043E \u043F\u043E\u0437\u0438\u0446\u0438\u0439 \u0432 \u043C\u0435\u043D\u044E", v: totalCount, f: `${data.length} \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u043A\u0443\u0445\u043D\u0438 \u0438 \u0431\u0430\u0440\u0430`, icon: "menuBook" },
    { l: "\u0412 \u043D\u0430\u043B\u0438\u0447\u0438\u0438 \u043D\u0430 \u043A\u0443\u0445\u043D\u0435", v: inStockCount, f: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u043A \u0437\u0430\u043A\u0430\u0437\u0443 \u0438 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0435", icon: "check" },
    { l: "\u0412 \u0441\u0442\u043E\u043F-\u043B\u0438\u0441\u0442\u0435", v: stoppedCount, f: "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0438\u0441\u044C \u0438\u043D\u0433\u0440\u0435\u0434\u0438\u0435\u043D\u0442\u044B", icon: "alert", warn: stoppedCount > 0 },
    { l: "\u0420\u0430\u0437\u0434\u0435\u043B\u044B \u043C\u0435\u043D\u044E", v: "3 \u043A\u0443\u0445\u043D\u0438", f: "\u0415\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u0430\u044F \xB7 \u041A\u043E\u0440\u0435\u0439\u0441\u043A\u0430\u044F \xB7 \u0411\u0430\u0440", icon: "layers" }
  ].map((c) => /* @__PURE__ */ React.createElement("div", { className: "card kpi", key: c.l }, /* @__PURE__ */ React.createElement("div", { className: "kpi-top" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, c.l), /* @__PURE__ */ React.createElement("span", { className: "kpi-ico", style: c.warn ? { color: "var(--warn)", background: "var(--warn-soft)" } : void 0 }, /* @__PURE__ */ React.createElement(Icon, { name: c.icon, size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("div", { className: "stat-num" }, c.v)), /* @__PURE__ */ React.createElement("div", { className: "kpi-foot" }, /* @__PURE__ */ React.createElement("span", { className: "trunc" }, c.f))))), /* @__PURE__ */ React.createElement("div", { className: "filters", style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, [
    ["all", `\u0412\u0441\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B (${totalCount})`],
    ["europe", "\u0415\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u0430\u044F \u043A\u0443\u0445\u043D\u044F"],
    ["korea", "\u041A\u043E\u0440\u0435\u0439\u0441\u043A\u0430\u044F \u043A\u0443\u0445\u043D\u044F"],
    ["bar", "\u0411\u0430\u0440\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430 & \u041D\u0430\u043F\u0438\u0442\u043A\u0438"]
  ].map(([id, label]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: id,
      className: "chip",
      "data-on": activeCuisine === id ? "1" : "0",
      onClick: () => setActiveCuisine(id)
    },
    label
  ))), /* @__PURE__ */ React.createElement("span", { className: "grow" }), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "plus", onClick: () => setIsAddModalOpen(true) }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0431\u043B\u044E\u0434\u043E"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: 260 } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", display: "flex" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 14 })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: search,
      onChange: (e) => setSearch(e.target.value),
      placeholder: "\u041F\u043E\u0438\u0441\u043A \u0431\u043B\u044E\u0434\u0430...",
      style: {
        width: "100%",
        height: 34,
        paddingLeft: 32,
        paddingRight: 10,
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
        borderRadius: "8px",
        color: "var(--text)",
        fontSize: 12,
        outline: "none",
        boxSizing: "border-box"
      }
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { overflow: "hidden" } }, filteredCategories.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "empty", style: { padding: 48, textAlign: "center" } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 28 }), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8, fontSize: 13, color: "var(--text-2)" } }, "\u041F\u043E \u0432\u0430\u0448\u0435\u043C\u0443 \u0437\u0430\u043F\u0440\u043E\u0441\u0443 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E")) : filteredCategories.map((cat, ci) => {
    const open = openCats[cat.cat] !== false;
    return /* @__PURE__ */ React.createElement("div", { key: cat.cat }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setOpenCats((o) => ({ ...o, [cat.cat]: !open })),
        style: {
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "var(--surface-2)",
          border: 0,
          borderTop: ci ? "1px solid var(--line)" : 0,
          borderBottom: open ? "1px solid var(--line-soft)" : 0,
          textAlign: "left",
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: open ? "chevronD" : "chevronR", size: 13, style: { color: "var(--text-3)" } }),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 800, letterSpacing: "var(--track-label)", textTransform: "uppercase", color: "var(--accent-2)" } }, cat.cat),
      /* @__PURE__ */ React.createElement("span", { className: "dim mono", style: { fontSize: 10.5, marginLeft: 4 } }, cat.items.length, " \u043F\u043E\u0437."),
      /* @__PURE__ */ React.createElement("span", { className: "grow" }),
      cat.items.some((i) => !i.on) && /* @__PURE__ */ React.createElement(Pill, { tone: "warn" }, "\u0415\u0441\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u0432 \u0441\u0442\u043E\u043F-\u043B\u0438\u0441\u0442\u0435")
    ), open && /* @__PURE__ */ React.createElement("div", { style: { width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" } }, /* @__PURE__ */ React.createElement(
      "table",
      {
        className: "tbl",
        style: {
          tableLayout: "fixed",
          width: "100%",
          minWidth: 540,
          borderCollapse: "collapse"
        }
      },
      /* @__PURE__ */ React.createElement("colgroup", null, /* @__PURE__ */ React.createElement("col", { style: { width: "42%" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "20%" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "18%" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "12%" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "8%" } })),
      /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { paddingLeft: 34, textAlign: "left" } }, "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0431\u043B\u044E\u0434\u0430"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, "\u0420\u0430\u0437\u0434\u0435\u043B \u043C\u0435\u043D\u044E"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "right", paddingRight: 24 } }, "\u0426\u0435\u043D\u0430"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "\u0421\u0442\u0430\u0442\u0443\u0441"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "\u0412 \u043F\u0440\u043E\u0434\u0430\u0436\u0435"))),
      /* @__PURE__ */ React.createElement("tbody", null, cat.items.map((it, i) => /* @__PURE__ */ React.createElement(
        "tr",
        {
          key: it.n,
          style: {
            cursor: "default",
            opacity: it.on ? 1 : 0.55,
            background: it.on ? "transparent" : "rgba(213, 97, 79, 0.05)"
          }
        },
        /* @__PURE__ */ React.createElement("td", { style: { paddingLeft: 34, textAlign: "left" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 600, fontSize: 12.5, color: "var(--text)" } }, it.n), it.nUz && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "var(--text-3)" } }, "uz: ", it.nUz))),
        /* @__PURE__ */ React.createElement("td", { style: { textAlign: "left" } }, /* @__PURE__ */ React.createElement("span", { className: "dim", style: { fontSize: 11 } }, it.section || cat.section || "\u041A\u0443\u0445\u043D\u044F")),
        /* @__PURE__ */ React.createElement(
          "td",
          {
            style: {
              textAlign: "right",
              paddingRight: 24,
              fontFamily: "var(--f-mono)",
              fontVariantNumeric: "tabular-nums",
              fontWeight: 700,
              fontSize: 12.5,
              color: "var(--accent-2)"
            }
          },
          /* @__PURE__ */ React.createElement(
            "span",
            {
              onClick: () => {
                setEditDish(it);
                setNewPrice(it.p);
              },
              title: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0446\u0435\u043D\u0443",
              style: { cursor: "pointer", borderBottom: "1px dashed var(--line-strong)" }
            },
            summ(it.p),
            " \u0441\u0443\u043C"
          )
        ),
        /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement(Pill, { tone: it.on ? "ok" : "danger" }, it.on ? "\u0412 \u043D\u0430\u043B\u0438\u0447\u0438\u0438" : "\u0421\u0442\u043E\u043F-\u043B\u0438\u0441\u0442")),
        /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", alignItems: "center" } }, /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => toggleStopList(cat.cat, i, it),
            role: "switch",
            "aria-checked": it.on,
            title: it.on ? "\u041F\u043E\u043C\u0435\u0441\u0442\u0438\u0442\u044C \u0432 \u0441\u0442\u043E\u043F-\u043B\u0438\u0441\u0442" : "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0432 \u043F\u0440\u043E\u0434\u0430\u0436\u0443",
            style: {
              width: 34,
              height: 19,
              borderRadius: 99,
              border: 0,
              padding: 2,
              background: it.on ? "var(--ok)" : "var(--surface-hi)",
              display: "flex",
              justifyContent: it.on ? "flex-end" : "flex-start",
              cursor: "pointer",
              transition: "all .18s var(--ease)"
            }
          },
          /* @__PURE__ */ React.createElement(
            "span",
            {
              style: {
                width: 15,
                height: 15,
                borderRadius: "50%",
                background: it.on ? "#fff" : "var(--text-3)",
                display: "block",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)"
              }
            }
          )
        )))
      )))
    )));
  })), editDish && /* @__PURE__ */ React.createElement("div", { className: "scrim", onClick: () => setEditDish(null), style: { display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      onClick: (e) => e.stopPropagation(),
      style: { width: 360, padding: 22, background: "var(--surface-2)", border: "1px solid var(--line-strong)" }
    },
    /* @__PURE__ */ React.createElement("div", { className: "label" }, "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0446\u0435\u043D\u044B"),
    /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, margin: "6px 0 16px", color: "var(--accent-2)" } }, editDish.n),
    /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 6 } }, "\u041D\u043E\u0432\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C (\u0432 \u0441\u0443\u043C\u0430\u0445):"),
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        value: newPrice,
        onChange: (e) => setNewPrice(e.target.value),
        autoFocus: true,
        style: {
          width: "100%",
          height: 42,
          padding: "0 12px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 15,
          fontFamily: "var(--f-mono)",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: 16
        }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "danger", icon: "trash", onClick: () => handleDeleteDish(editDish) }, "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0431\u043B\u044E\u0434\u043E"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-ghost", onClick: () => setEditDish(null) }, "\u041E\u0442\u043C\u0435\u043D\u0430"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "check", onClick: handleSavePrice }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0446\u0435\u043D\u0443")))
  )), isAddModalOpen && /* @__PURE__ */ React.createElement("div", { className: "scrim", onClick: () => setIsAddModalOpen(false), style: { display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      onClick: (e) => e.stopPropagation(),
      style: { width: 440, maxWidth: "90vw", padding: 22, background: "var(--surface-2)", border: "1px solid var(--line-strong)", maxHeight: "90vh", overflowY: "auto" }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "var(--accent-2)" } }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0431\u043B\u044E\u0434\u043E \u0432 \u043C\u0435\u043D\u044E"), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setIsAddModalOpen(false),
        style: { background: "none", border: 0, color: "var(--text-3)", cursor: "pointer", padding: 4 }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 16 })
    )),
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 } }, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0431\u043B\u044E\u0434\u0430 (RU) *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0421\u0442\u0435\u0439\u043A \u041D\u044C\u044E-\u0419\u043E\u0440\u043A",
        value: newDishData.name,
        onChange: (e) => setNewDishData({ ...newDishData, name: e.target.value }),
        style: {
          width: "100%",
          height: 38,
          padding: "0 10px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box"
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 } }, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 (UZ)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "O'zbekcha",
        value: newDishData.nameUz,
        onChange: (e) => setNewDishData({ ...newDishData, nameUz: e.target.value }),
        style: {
          width: "100%",
          height: 36,
          padding: "0 10px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 12,
          outline: "none",
          boxSizing: "border-box"
        }
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 } }, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 (EN)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "English",
        value: newDishData.nameEn,
        onChange: (e) => setNewDishData({ ...newDishData, nameEn: e.target.value }),
        style: {
          width: "100%",
          height: 36,
          padding: "0 10px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 12,
          outline: "none",
          boxSizing: "border-box"
        }
      }
    ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 } }, "\u041A\u0443\u0445\u043D\u044F / \u0420\u0430\u0437\u0434\u0435\u043B *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: newDishData.cuisine,
        onChange: (e) => {
          const c = e.target.value;
          const defaultCat = c === "europe" ? "starters" : c === "korea" ? "starters" : "cocktails";
          setNewDishData({ ...newDishData, cuisine: c, category: defaultCat });
        },
        style: {
          width: "100%",
          height: 36,
          padding: "0 8px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 12,
          outline: "none",
          boxSizing: "border-box"
        }
      },
      /* @__PURE__ */ React.createElement("option", { value: "europe" }, "\u0415\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u0430\u044F \u043A\u0443\u0445\u043D\u044F"),
      /* @__PURE__ */ React.createElement("option", { value: "korea" }, "\u041A\u043E\u0440\u0435\u0439\u0441\u043A\u0430\u044F \u043A\u0443\u0445\u043D\u044F"),
      /* @__PURE__ */ React.createElement("option", { value: "bar" }, "\u0411\u0430\u0440\u043D\u0430\u044F \u043A\u0430\u0440\u0442\u0430 & \u041D\u0430\u043F\u0438\u0442\u043A\u0438")
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 } }, "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: newDishData.category,
        onChange: (e) => setNewDishData({ ...newDishData, category: e.target.value }),
        style: {
          width: "100%",
          height: 36,
          padding: "0 8px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 12,
          outline: "none",
          boxSizing: "border-box"
        }
      },
      newDishData.cuisine === "europe" && [
        ["starters", "\u0417\u0430\u043A\u0443\u0441\u043A\u0438"],
        ["salads", "\u0421\u0430\u043B\u0430\u0442\u044B"],
        ["soups", "\u041F\u0435\u0440\u0432\u044B\u0435 \u0431\u043B\u044E\u0434\u0430"],
        ["mains", "\u0412\u0442\u043E\u0440\u044B\u0435 \u0431\u043B\u044E\u0434\u0430"],
        ["kebabs", "\u0428\u0430\u0448\u043B\u044B\u043A\u0438 \u043A\u0430\u0432\u043A\u0430\u0437\u0441\u043A\u0438\u0435"],
        ["mini-kebabs", "\u041C\u0430\u043B\u0435\u043D\u044C\u043A\u0438\u0435 \u0448\u0430\u0448\u043B\u044B\u043A\u0438"],
        ["fish", "\u0420\u044B\u0431\u043D\u044B\u0435"],
        ["grilled-veg", "\u041E\u0432\u043E\u0449\u043D\u044B\u0435"],
        ["sides", "\u0413\u0430\u0440\u043D\u0438\u0440\u044B"],
        ["bread", "\u0425\u043B\u0435\u0431\u0430"],
        ["soft", "\u041D\u0430\u043F\u0438\u0442\u043A\u0438"]
      ].map(([val, lbl]) => /* @__PURE__ */ React.createElement("option", { key: val, value: val }, lbl)),
      newDishData.cuisine === "korea" && [
        ["starters", "\u0417\u0430\u043A\u0443\u0441\u043A\u0438"],
        ["salads", "\u0421\u0430\u043B\u0430\u0442\u044B"],
        ["soups", "\u041F\u0435\u0440\u0432\u044B\u0435 \u0431\u043B\u044E\u0434\u0430"],
        ["mains", "\u0412\u0442\u043E\u0440\u044B\u0435 \u0431\u043B\u044E\u0434\u0430"],
        ["flour", "\u041C\u0443\u0447\u043D\u044B\u0435 \u0438\u0437\u0434\u0435\u043B\u0438\u044F"],
        ["tea", "\u0427\u0430\u0439"]
      ].map(([val, lbl]) => /* @__PURE__ */ React.createElement("option", { key: val, value: val }, lbl)),
      newDishData.cuisine === "bar" && [
        ["cocktails", "\u041A\u043E\u043A\u0442\u0435\u0439\u043B\u0438"],
        ["lemonades", "\u041B\u0438\u043C\u043E\u043D\u0430\u0434\u044B"],
        ["coffee", "\u041A\u043E\u0444\u0435"],
        ["whisky", "\u0412\u0438\u0441\u043A\u0438"],
        ["vodka", "\u0412\u043E\u0434\u043A\u0430"],
        ["beer", "\u041F\u0438\u0432\u043E"],
        ["tequila", "\u0422\u0435\u043A\u0438\u043B\u0430"],
        ["rum", "\u0420\u043E\u043C"],
        ["cognac", "\u041A\u043E\u043D\u044C\u044F\u043A"],
        ["wine", "\u0412\u0438\u043D\u043E"],
        ["snacks", "\u0421\u043D\u0435\u043A\u0438"]
      ].map(([val, lbl]) => /* @__PURE__ */ React.createElement("option", { key: val, value: val }, lbl))
    ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 } }, "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C (\u0432 \u0441\u0443\u043C\u0430\u0445) *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 120000",
        value: newDishData.price,
        onChange: (e) => setNewDishData({ ...newDishData, price: e.target.value }),
        style: {
          width: "100%",
          height: 36,
          padding: "0 10px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "var(--f-mono)",
          outline: "none",
          boxSizing: "border-box"
        }
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 } }, "\u041F\u043E\u0440\u0446\u0438\u044F / \u0420\u0430\u0437\u043C\u0435\u0440"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "1 \u043F\u043E\u0440\u0446\u0438\u044F / 300 \u0433\u0440 / 0.5 \u043B",
        value: newDishData.size,
        onChange: (e) => setNewDishData({ ...newDishData, size: e.target.value }),
        style: {
          width: "100%",
          height: 36,
          padding: "0 10px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 12,
          outline: "none",
          boxSizing: "border-box"
        }
      }
    ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 11, color: "var(--text-2)", display: "block", marginBottom: 4 } }, "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 / \u0421\u043E\u0441\u0442\u0430\u0432"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        placeholder: "\u0418\u043D\u0433\u0440\u0435\u0434\u0438\u0435\u043D\u0442\u044B, \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u043F\u043E\u0434\u0430\u0447\u0438",
        value: newDishData.note,
        onChange: (e) => setNewDishData({ ...newDishData, note: e.target.value }),
        style: {
          width: "100%",
          height: 36,
          padding: "0 10px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: "8px",
          color: "var(--text)",
          fontSize: 12,
          outline: "none",
          boxSizing: "border-box"
        }
      }
    )), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-ghost", onClick: () => setIsAddModalOpen(false) }, "\u041E\u0442\u043C\u0435\u043D\u0430"), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "check", onClick: handleCreateDish }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u043C\u0435\u043D\u044E")))
  )));
}
const STAFF_ROLE_OPTIONS = [
  { value: "\u041A\u0443\u0440\u044C\u0435\u0440", label: "\u041A\u0443\u0440\u044C\u0435\u0440 (\u0421\u043B\u0443\u0436\u0431\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438)", icon: "bike", group: "courier" },
  { value: "\u0414\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440", label: "\u0414\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 \u0441\u043C\u0435\u043D\u044B", icon: "sliders", group: "mgmt" },
  { value: "\u0428\u0435\u0444-\u043F\u043E\u0432\u0430\u0440", label: "\u0428\u0435\u0444-\u043F\u043E\u0432\u0430\u0440 \u043A\u0443\u0445\u043D\u0438", icon: "flame", group: "kitchen" },
  { value: "\u041E\u0444\u0438\u0446\u0438\u0430\u043D\u0442", label: "\u041E\u0444\u0438\u0446\u0438\u0430\u043D\u0442 \u0437\u0430\u043B\u0430", icon: "door", group: "hall" },
  { value: "\u0411\u0430\u0440\u043C\u0435\u043D", label: "\u0411\u0430\u0440\u043C\u0435\u043D", icon: "palette", group: "hall" },
  { value: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440", label: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u0441\u043C\u0435\u043D\u044B", icon: "users", group: "mgmt" },
  { value: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440", label: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440", icon: "star", group: "mgmt" }
];
const STAFF_SHIFT_OPTIONS = [
  "11:00 \u2013 23:00 (\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u043D\u0430\u044F)",
  "09:00 \u2013 18:00 (\u0423\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u0441\u043C\u0435\u043D\u0430)",
  "18:00 \u2013 02:00 (\u0412\u0435\u0447\u0435\u0440\u043D\u044F\u044F / \u041D\u043E\u0447\u043D\u0430\u044F)",
  "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0433\u0440\u0430\u0444\u0438\u043A"
];
const STAFF_VEHICLE_OPTIONS = [
  "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C",
  "\u0421\u043A\u0443\u0442\u0435\u0440 / \u041C\u043E\u0442\u043E\u0446\u0438\u043A\u043B",
  "\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u0432\u0435\u043B\u043E\u0441\u0438\u043F\u0435\u0434",
  "\u041F\u0435\u0448\u0438\u0439 \u043A\u0443\u0440\u044C\u0435\u0440"
];
function getRoleIcon(roleName = "") {
  const r = String(roleName).toLowerCase();
  if (r.includes("\u043A\u0443\u0440\u044C\u0435\u0440") || r === "courier") return "bike";
  if (r.includes("\u043F\u043E\u0432\u0430\u0440") || r.includes("\u0448\u0435\u0444")) return "flame";
  if (r.includes("\u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442") || r.includes("\u0431\u0430\u0440")) return "door";
  if (r.includes("\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440")) return "sliders";
  if (r.includes("\u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440") || r.includes("\u0430\u0434\u043C\u0438\u043D")) return "users";
  return "users";
}
function StaffModal({ isOpen, onClose, onSave, initialStaff, toast }) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("\u041A\u0443\u0440\u044C\u0435\u0440");
  const [userName, setUserName] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [shift, setShift] = useState("11:00 \u2013 23:00");
  const [status, setStatus] = useState("online");
  const [vehicle, setVehicle] = useState("\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C");
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(initialStaff && (initialStaff.id || initialStaff.user_id));
  useEffect(() => {
    if (isOpen) {
      if (initialStaff) {
        setFullName(initialStaff.name || initialStaff.full_name || "");
        setRole(initialStaff.role || "\u041A\u0443\u0440\u044C\u0435\u0440");
        setUserName(initialStaff.user_name || "");
        setTelegramId(initialStaff.telegram_id ? String(initialStaff.telegram_id) : "");
        setPhone(initialStaff.phone || "+998 ");
        setShift(initialStaff.shift || "11:00 \u2013 23:00");
        setStatus(initialStaff.status || "online");
        setVehicle(initialStaff.vehicle || "\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C");
      } else {
        setFullName("");
        setRole("\u041A\u0443\u0440\u044C\u0435\u0440");
        setUserName("");
        setTelegramId("");
        setPhone("+998 ");
        setShift("11:00 \u2013 23:00");
        setStatus("online");
        setVehicle("\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C");
      }
      setSubmitting(false);
    }
  }, [isOpen, initialStaff]);
  if (!isOpen) return null;
  const isCourier = role === "\u041A\u0443\u0440\u044C\u0435\u0440" || role.toLowerCase().includes("\u043A\u0443\u0440\u044C\u0435\u0440") || role === "courier";
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      toast("\u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u0424\u0418\u041E \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430", "warn", "alert");
      return;
    }
    setSubmitting(true);
    try {
      const cleanShift = shift.split(" (")[0].trim();
      const payload = {
        user_id: isEditing ? initialStaff.id || initialStaff.user_id : void 0,
        full_name: fullName.trim(),
        role: role.trim(),
        user_name: userName.replace(/^@/, "").trim(),
        telegram_id: telegramId.trim(),
        phone: phone.trim(),
        shift: cleanShift,
        status,
        vehicle: isCourier ? vehicle : ""
      };
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        toast(isEditing ? `\u0414\u0430\u043D\u043D\u044B\u0435 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430 ${fullName.trim()} \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u044B` : `\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A ${fullName.trim()} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D`, "ok", "check");
        onSave && onSave();
        onClose();
      } else {
        toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F: " + (data.error || "\u0421\u0431\u043E\u0439 \u0441\u0435\u0440\u0432\u0435\u0440\u0430"), "danger", "alert");
      }
    } catch (err) {
      toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0435\u0442\u0438: " + err.message, "danger", "alert");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "scrim", onClick: onClose, style: { display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      onClick: (e) => e.stopPropagation(),
      style: {
        width: 560,
        maxWidth: "95vw",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        overflow: "hidden",
        background: "var(--surface-2)",
        border: "1px solid var(--line-strong)",
        boxShadow: "var(--shadow-pop)",
        borderRadius: 14
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      padding: "16px 20px",
      borderBottom: "1px solid var(--line)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--surface)"
    } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "var(--text)" } }, isEditing ? "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430" : "\u041D\u043E\u0432\u044B\u0439 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A \u0441\u043C\u0435\u043D\u044B"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-3)", marginTop: 2 } }, isEditing ? `\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F: ${initialStaff.name || initialStaff.full_name}` : "\u0428\u0442\u0430\u0442\u043D\u043E\u0435 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 Fenix & \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u044F \u0441 Telegram-\u0431\u043E\u0442\u043E\u043C")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-sm btn-ghost",
        onClick: onClose,
        style: { width: 32, height: 32, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 })
    )),
    /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", overflow: "hidden", flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" } }, "\u0424\u0418\u041E \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430 *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: fullName,
        onChange: (e) => setFullName(e.target.value),
        placeholder: "\u0418\u0431\u0440\u043E\u0445\u0438\u043C\u043E\u0432 \u0410\u043B\u0438\u0448\u0435\u0440",
        autoFocus: true,
        required: true,
        style: {
          width: "100%",
          height: 40,
          padding: "0 12px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box"
        }
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" } }, "\u0414\u043E\u043B\u0436\u043D\u043E\u0441\u0442\u044C *"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: role,
        onChange: (e) => setRole(e.target.value),
        style: {
          width: "100%",
          height: 40,
          padding: "0 12px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
          cursor: "pointer"
        }
      },
      STAFF_ROLE_OPTIONS.map((r) => /* @__PURE__ */ React.createElement("option", { key: r.value, value: r.value }, r.label))
    ))), isCourier && /* @__PURE__ */ React.createElement("div", { style: {
      background: "rgba(212, 175, 55, 0.06)",
      border: "1px solid rgba(212, 175, 55, 0.28)",
      borderRadius: 10,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 12
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, color: "var(--accent-2)" } }, /* @__PURE__ */ React.createElement(Icon, { name: "bike", size: 16 }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em" } }, "\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0441 \u0431\u043E\u0442\u043E\u043C @FenixRestaurantCourierBot")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.45 } }, '\u0414\u043B\u044F \u043A\u0443\u0440\u044C\u0435\u0440\u043E\u0432 Telegram \u043A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432\u0430\u0436\u0435\u043D: \u0447\u0435\u0440\u0435\u0437 \u0431\u043E\u0442\u0430 \u043F\u0440\u0438\u0445\u043E\u0434\u044F\u0442 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438 \u0441 \u0430\u0434\u0440\u0435\u0441\u043E\u043C, \u0441\u043E\u0441\u0442\u0430\u0432\u043E\u043C \u0431\u043B\u044E\u0434, \u0441\u0443\u043C\u043C\u043E\u0439 \u0438 \u0431\u044B\u0441\u0442\u0440\u043E\u0439 \u043A\u043D\u043E\u043F\u043A\u043E\u0439 "\u0417\u0430\u043A\u0430\u0437 \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D", \u0430 \u0442\u0430\u043A\u0436\u0435 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u0438\u0437 \u0430\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u0438.'), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 5 } }, "Telegram @username"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", left: 10, color: "var(--text-3)", fontSize: 13, fontFamily: "var(--f-mono)" } }, "@"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: userName,
        onChange: (e) => setUserName(e.target.value),
        placeholder: "courier_username",
        style: {
          width: "100%",
          height: 38,
          padding: "0 12px 0 24px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 12.5,
          fontFamily: "var(--f-mono)",
          outline: "none",
          boxSizing: "border-box"
        }
      }
    ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 5 } }, "Telegram Chat ID (\u0447\u0438\u0441\u043B\u043E\u0432\u043E\u0439)"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: telegramId,
        onChange: (e) => setTelegramId(e.target.value),
        placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 682194812",
        style: {
          width: "100%",
          height: 38,
          padding: "0 12px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 12.5,
          fontFamily: "var(--f-mono)",
          outline: "none",
          boxSizing: "border-box"
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9.5, color: "var(--text-3)", marginTop: 4 } }, "\u041A\u0443\u0440\u044C\u0435\u0440 \u0443\u0437\u043D\u0430\u0435\u0442 \u0441\u0432\u043E\u0439 ID \u043A\u043E\u043C\u0430\u043D\u0434\u043E\u0439 /start \u0432 \u0431\u043E\u0442\u0435"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 5 } }, "\u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442 \u043A\u0443\u0440\u044C\u0435\u0440\u0430"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: vehicle,
        onChange: (e) => setVehicle(e.target.value),
        style: {
          width: "100%",
          height: 38,
          padding: "0 12px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 12.5,
          outline: "none",
          boxSizing: "border-box",
          cursor: "pointer"
        }
      },
      STAFF_VEHICLE_OPTIONS.map((v) => /* @__PURE__ */ React.createElement("option", { key: v, value: v }, v))
    ))), !isCourier && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" } }, "Telegram \u0430\u043A\u043A\u0430\u0443\u043D\u0442 (@username \u0438\u043B\u0438 \u0447\u0438\u0441\u043B\u043E\u0432\u043E\u0439 ID)"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "flex", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", left: 10, color: "var(--text-3)", fontSize: 13, fontFamily: "var(--f-mono)" } }, "@"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: userName,
        onChange: (e) => setUserName(e.target.value),
        placeholder: "username",
        style: {
          width: "100%",
          height: 40,
          padding: "0 12px 0 24px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "var(--f-mono)",
          outline: "none",
          boxSizing: "border-box"
        }
      }
    ))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" } }, "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u044B\u0439 \u0442\u0435\u043B\u0435\u0444\u043E\u043D *"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: phone,
        onChange: (e) => setPhone(e.target.value),
        placeholder: "+998 90 123 45 67",
        style: {
          width: "100%",
          height: 40,
          padding: "0 12px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 13,
          fontFamily: "var(--f-mono)",
          outline: "none",
          boxSizing: "border-box"
        }
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" } }, "\u0413\u0440\u0430\u0444\u0438\u043A / \u0421\u043C\u0435\u043D\u0430"), /* @__PURE__ */ React.createElement(
      "select",
      {
        value: shift,
        onChange: (e) => setShift(e.target.value),
        style: {
          width: "100%",
          height: 40,
          padding: "0 12px",
          background: "var(--surface)",
          border: "1px solid var(--line-strong)",
          borderRadius: 8,
          color: "var(--text)",
          fontSize: 12.5,
          outline: "none",
          boxSizing: "border-box",
          cursor: "pointer"
        }
      },
      STAFF_SHIFT_OPTIONS.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s))
    ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 10.5, fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" } }, "\u0421\u0442\u0430\u0442\u0443\u0441 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setStatus("online"),
        style: {
          flex: 1,
          height: 38,
          borderRadius: 8,
          border: status === "online" ? "1px solid var(--ok)" : "1px solid var(--line)",
          background: status === "online" ? "var(--ok-soft)" : "var(--surface)",
          color: status === "online" ? "var(--ok)" : "var(--text-2)",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: "var(--ok)" } }),
      "\u041D\u0430 \u0441\u043C\u0435\u043D\u0435 (\u0410\u043A\u0442\u0438\u0432\u0435\u043D)"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setStatus("off"),
        style: {
          flex: 1,
          height: 38,
          borderRadius: 8,
          border: status === "off" ? "1px solid var(--line-strong)" : "1px solid var(--line)",
          background: status === "off" ? "var(--surface-3)" : "var(--surface)",
          color: status === "off" ? "var(--text)" : "var(--text-3)",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { width: 7, height: 7, borderRadius: "50%", background: "var(--text-3)" } }),
      "\u0412\u044B\u0445\u043E\u0434\u043D\u043E\u0439"
    )))), /* @__PURE__ */ React.createElement("div", { style: {
      padding: "14px 20px",
      borderTop: "1px solid var(--line)",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10
    } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-sm btn-ghost",
        onClick: onClose,
        disabled: submitting
      },
      "\u041E\u0442\u043C\u0435\u043D\u0430"
    ), /* @__PURE__ */ React.createElement(
      Btn,
      {
        type: "submit",
        size: "sm",
        variant: "accent",
        icon: "check",
        disabled: submitting
      },
      submitting ? "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435..." : isEditing ? "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F" : "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430"
    )))
  ));
}
function Staff({ t, toast }) {
  const [team, setTeam] = useState(FX.staff);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fetchStaff = () => {
    fetch("/api/admin/staff").then((res) => res.json()).then((data) => {
      if (data.ok && Array.isArray(data.staff) && data.staff.length > 0) {
        const mapped = data.staff.map((s) => {
          const initials2 = s.full_name ? s.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "??";
          return {
            id: s.user_id,
            user_id: s.user_id,
            name: s.full_name,
            full_name: s.full_name,
            role: s.role,
            shift: s.shift || "11:00 \u2013 23:00",
            status: s.status || "online",
            initials: initials2,
            phone: s.phone || "+998 90 019 57 65",
            user_name: s.user_name || "",
            telegram_id: s.telegram_id || s.user_id,
            vehicle: s.vehicle || ""
          };
        });
        setTeam(mapped);
      }
    }).catch((err) => console.error("Staff fetch error:", err));
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
    const nextStatus = m.status === "online" ? "off" : "online";
    try {
      const res = await fetch("/api/admin/staff/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: m.id || m.user_id, status: nextStatus })
      });
      const data = await res.json();
      if (data.ok) {
        toast(`\u0421\u0442\u0430\u0442\u0443\u0441 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430 ${m.name} \u0438\u0437\u043C\u0435\u043D\u0451\u043D \u043D\u0430 "${nextStatus === "online" ? "\u041D\u0430 \u0441\u043C\u0435\u043D\u0435" : "\u0412\u044B\u0445\u043E\u0434\u043D\u043E\u0439"}"`, "ok", "check");
        fetchStaff();
      }
    } catch (e) {
      toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0443\u0441\u0430: " + e.message, "danger", "alert");
    }
  };
  const handleDelete = async (m) => {
    if (!window.confirm(`\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430 ${m.name} (${m.role}) \u0438\u0437 \u0448\u0442\u0430\u0442\u0430 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0430?`)) return;
    try {
      const res = await fetch("/api/admin/staff/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: m.id || m.user_id })
      });
      const data = await res.json();
      if (data.ok) {
        toast(`\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A ${m.name} \u0443\u0434\u0430\u043B\u0451\u043D \u0438\u0437 \u0441\u043C\u0435\u043D\u044B`, "ok", "trash");
        fetchStaff();
      }
    } catch (e) {
      toast("\u041E\u0448\u0438\u0431\u043A\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430: " + e.message, "danger", "alert");
    }
  };
  const filteredTeam = useMemo(() => {
    return team.filter((m) => {
      if (filterRole === "courier") {
        const isC = m.role.toLowerCase().includes("\u043A\u0443\u0440\u044C\u0435\u0440") || m.role === "courier";
        if (!isC) return false;
      } else if (filterRole === "kitchen") {
        const isK = m.role.toLowerCase().includes("\u043F\u043E\u0432\u0430\u0440") || m.role.toLowerCase().includes("\u0448\u0435\u0444");
        if (!isK) return false;
      } else if (filterRole === "hall") {
        const isH = m.role.toLowerCase().includes("\u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442") || m.role.toLowerCase().includes("\u0431\u0430\u0440\u043C\u0435\u043D");
        if (!isH) return false;
      } else if (filterRole === "mgmt") {
        const isM = m.role.toLowerCase().includes("\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440") || m.role.toLowerCase().includes("\u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440") || m.role.toLowerCase().includes("\u0430\u0434\u043C\u0438\u043D");
        if (!isM) return false;
      }
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
  const couriersOnline = team.filter((m) => (m.role.toLowerCase().includes("\u043A\u0443\u0440\u044C\u0435\u0440") || m.role === "courier") && m.status === "online").length;
  const staffOnline = team.filter((m) => m.status === "online").length;
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "kpis" }, [
    { l: "\u0412\u0441\u0435\u0433\u043E \u0432 \u0448\u0442\u0430\u0442\u0435", v: team.length, f: "\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B Fenix Restobar", icon: "users" },
    { l: "\u041D\u0430 \u0441\u043C\u0435\u043D\u0435 \u0441\u0435\u0439\u0447\u0430\u0441", v: staffOnline, f: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0440\u0430\u0431\u043E\u0447\u0438\u0439 \u0441\u043E\u0441\u0442\u0430\u0432", icon: "check" },
    { l: "\u041A\u0443\u0440\u044C\u0435\u0440\u043E\u0432 \u0430\u043A\u0442\u0438\u0432\u043D\u043E", v: couriersOnline, f: "\u0421\u043B\u0443\u0436\u0431\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438 \u043D\u0430 \u043B\u0438\u043D\u0438\u0438", icon: "bike", warn: couriersOnline === 0 },
    { l: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0441\u043C\u0435\u043D\u044B", v: "11:00 \u2013 23:00", f: "\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u0441\u043C\u0435\u043D\u0430 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u0430", icon: "clock" }
  ].map((c) => /* @__PURE__ */ React.createElement("div", { className: "card kpi", key: c.l }, /* @__PURE__ */ React.createElement("div", { className: "kpi-top" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, c.l), /* @__PURE__ */ React.createElement("span", { className: "kpi-ico", style: c.warn ? { color: "var(--warn)", background: "var(--warn-soft)" } : void 0 }, /* @__PURE__ */ React.createElement(Icon, { name: c.icon, size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("div", { className: "stat-num" }, c.v)), /* @__PURE__ */ React.createElement("div", { className: "kpi-foot" }, /* @__PURE__ */ React.createElement("span", { className: "trunc" }, c.f))))), /* @__PURE__ */ React.createElement("div", { className: "filters", style: { flexWrap: "wrap", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", gap: 6, background: "var(--surface)", padding: 4, borderRadius: 8, border: "1px solid var(--line)" } }, [
    { id: "all", label: "\u0412\u0441\u0435" },
    { id: "courier", label: "\u041A\u0443\u0440\u044C\u0435\u0440\u044B" },
    { id: "hall", label: "\u0417\u0430\u043B & \u0411\u0430\u0440" },
    { id: "kitchen", label: "\u041A\u0443\u0445\u043D\u044F" },
    { id: "mgmt", label: "\u041C\u0435\u043D\u0435\u0434\u0436\u043C\u0435\u043D\u0442" }
  ].map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab.id,
      onClick: () => setFilterRole(tab.id),
      style: {
        background: filterRole === tab.id ? "var(--accent)" : "transparent",
        color: filterRole === tab.id ? "#0b0a08" : "var(--text-2)",
        fontWeight: filterRole === tab.id ? 700 : 500,
        fontSize: 11.5,
        border: "none",
        borderRadius: 6,
        padding: "5px 11px",
        cursor: "pointer",
        transition: "all 0.15s ease"
      }
    },
    tab.label
  ))), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--surface)",
    border: "1px solid var(--line-strong)",
    borderRadius: 8,
    padding: "0 10px",
    height: 34,
    minWidth: 200
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "search", size: 13, style: { color: "var(--text-3)" } }), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      placeholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0424\u0418\u041E, \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0443, TG...",
      style: {
        border: "none",
        background: "transparent",
        outline: "none",
        color: "var(--text)",
        fontSize: 11.5,
        width: "100%"
      }
    }
  ), searchQuery && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setSearchQuery(""),
      style: { border: "none", background: "transparent", cursor: "pointer", color: "var(--text-3)", padding: 0 }
    },
    /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 11 })
  )), /* @__PURE__ */ React.createElement("span", { className: "grow" }), /* @__PURE__ */ React.createElement(Btn, { size: "sm", variant: "accent", icon: "plus", onClick: handleOpenAdd }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { className: "tbl-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "tbl", style: { tableLayout: "fixed", width: "100%" } }, /* @__PURE__ */ React.createElement("colgroup", null, /* @__PURE__ */ React.createElement("col", { style: { width: "30%" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "22%" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "18%" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "16%" } }), /* @__PURE__ */ React.createElement("col", { style: { width: "14%" } })), /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: { paddingLeft: 20, textAlign: "left" } }, "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A & Telegram"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, "\u0414\u043E\u043B\u0436\u043D\u043E\u0441\u0442\u044C & \u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, "\u041A\u043E\u043D\u0442\u0430\u043A\u0442"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "left" } }, "\u0413\u0440\u0430\u0444\u0438\u043A / \u0421\u043C\u0435\u043D\u0430"), /* @__PURE__ */ React.createElement("th", { style: { textAlign: "center" } }, "\u0421\u0442\u0430\u0442\u0443\u0441 / \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F"))), /* @__PURE__ */ React.createElement("tbody", null, filteredTeam.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: 5, style: { textAlign: "center", padding: "36px 0", color: "var(--text-3)" } }, "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B")) : filteredTeam.map((m) => {
    const isCourier = m.role.toLowerCase().includes("\u043A\u0443\u0440\u044C\u0435\u0440") || m.role === "courier";
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: m.id || m.name,
        onClick: () => handleEdit(m),
        title: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u0441\u0442\u0440\u043E\u043A\u0443 \u0434\u043B\u044F \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430",
        style: { cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement("td", { style: { paddingLeft: 20 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { className: "avatar", "data-tone": isCourier ? "info" : "accent" }, m.initials), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", null, m.name), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-3)", opacity: 0.6 }, title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C" }, /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 10 }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginTop: 2 } }, m.user_name ? /* @__PURE__ */ React.createElement(
        "a",
        {
          href: `https://t.me/${m.user_name}`,
          target: "_blank",
          rel: "noreferrer",
          onClick: (e) => e.stopPropagation(),
          className: "mono",
          style: { color: "var(--accent)", textDecoration: "none", fontSize: 10.5 }
        },
        "@",
        m.user_name
      ) : /* @__PURE__ */ React.createElement("span", { className: "dim mono", style: { fontSize: 10.5 } }, "\u0411\u0435\u0437 \u044E\u0437\u0435\u0440\u043D\u0435\u0439\u043C\u0430"), m.telegram_id && String(m.telegram_id) !== String(m.id) && /* @__PURE__ */ React.createElement("span", { className: "mono dim", style: { fontSize: 9.5, background: "var(--surface-3)", padding: "1px 5px", borderRadius: 4 } }, "TG ID: ", m.telegram_id))))),
      /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: isCourier ? "var(--info)" : "var(--text-2)" } }, /* @__PURE__ */ React.createElement(Icon, { name: getRoleIcon(m.role), size: 13 })), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 500, color: "var(--text)" } }, m.role)), isCourier && m.vehicle && /* @__PURE__ */ React.createElement("div", { className: "dim mono", style: { fontSize: 10, marginTop: 3 } }, m.vehicle)),
      /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(
        "a",
        {
          href: `tel:${m.phone}`,
          onClick: (e) => e.stopPropagation(),
          className: "mono",
          style: {
            color: "var(--text-2)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11
          }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "phone", size: 11 }),
        m.phone
      )),
      /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "mono dim", style: { fontSize: 11 } }, m.shift)),
      /* @__PURE__ */ React.createElement("td", { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "inline-flex", alignItems: "center", gap: 6, justifyContent: "center" } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: (e) => {
            e.stopPropagation();
            toggleStatus(m);
          },
          title: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0441\u043C\u0435\u043D\u044B",
          style: { background: "transparent", border: "none", padding: 0, cursor: "pointer" }
        },
        /* @__PURE__ */ React.createElement(Pill, { tone: m.status === "online" ? "ok" : "muted", dot: true }, m.status === "online" ? "\u041D\u0430 \u0441\u043C\u0435\u043D\u0435" : "\u0412\u044B\u0445\u043E\u0434\u043D\u043E\u0439")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "btn btn-sm btn-ghost",
          title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430",
          onClick: (e) => {
            e.stopPropagation();
            handleEdit(m);
          },
          style: { width: 28, height: 28, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "edit", size: 12 })
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "btn btn-sm btn-ghost",
          title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430",
          onClick: (e) => {
            e.stopPropagation();
            handleDelete(m);
          },
          style: { width: 28, height: 28, padding: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" }
        },
        /* @__PURE__ */ React.createElement(Icon, { name: "trash", size: 12 })
      )))
    );
  }))))), /* @__PURE__ */ React.createElement(
    StaffModal,
    {
      isOpen: modalOpen,
      onClose: () => {
        setModalOpen(false);
        setEditingStaff(null);
      },
      initialStaff: editingStaff,
      onSave: fetchStaff,
      toast
    }
  ));
}
Object.assign(window, { Couriers, MenuScreen, Staff });
function Analytics({ t, orders = [] }) {
  const completedOrders = orders.filter((o) => o.col === "done");
  const total = orders.reduce((s, o) => s + (o.total || 0), 0);
  const completedTotal = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = orders.length;
  const completedCount = completedOrders.length;
  const cancelledCount = orders.filter((o) => (o.status || "").includes("\u043E\u0442\u043C\u0435\u043D")).length;
  const avgCheck = totalOrders > 0 ? Math.round(total / totalOrders) : 0;
  const completionRate = totalOrders > 0 ? Math.round(completedCount / totalOrders * 100) : 100;
  const hours = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
  const realHourly = hours.map((h) => {
    const hr = parseInt(h.split(":")[0]);
    const inHour = orders.filter((o) => {
      const d = new Date(o.createdAt || Date.now());
      return d.getHours() === hr;
    });
    return Math.round(inHour.reduce((s, o) => s + (o.total || 0), 0) / 1e3);
  });
  const itemCounts = {};
  orders.forEach((o) => {
    (o.items || []).forEach((it) => {
      const n = it.n || "\u0411\u043B\u044E\u0434\u043E";
      itemCounts[n] = (itemCounts[n] || 0) + (it.q || 1);
    });
  });
  const topList = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const maxTop = topList.length > 0 ? Math.max(...topList.map((x) => x[1])) : 1;
  const delCount = orders.filter((o) => o.type === "delivery").length;
  const pickCount = orders.filter((o) => o.type === "pickup").length;
  const hallCount = orders.filter((o) => o.type === "hall").length;
  const safeTotal = totalOrders || 1;
  return /* @__PURE__ */ React.createElement("div", { className: "page" }, /* @__PURE__ */ React.createElement("div", { className: "kpis" }, [
    { l: "revenue_today", v: summ(total), f: `${totalOrders} \u0447\u0435\u043A\u043E\u0432 \u0437\u0430 \u0441\u043C\u0435\u043D\u0443`, icon: "wallet" },
    { l: "avg_check", v: summ(avgCheck), f: "\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0447\u0435\u043A \u0437\u0430\u043A\u0430\u0437\u0430", icon: "receipt" },
    { l: "completed", v: completedCount, f: `\u0418\u0437 ${totalOrders} \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \xB7 ${completionRate}%`, icon: "check" },
    { l: "cancellations", v: cancelledCount, f: `${cancelledCount} \u043E\u0442\u043C\u0435\u043D`, icon: "x", warn: cancelledCount > 0 }
  ].map((c) => /* @__PURE__ */ React.createElement("div", { className: "card kpi", key: c.l }, /* @__PURE__ */ React.createElement("div", { className: "kpi-top" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, t(c.l)), /* @__PURE__ */ React.createElement("span", { className: "kpi-ico", style: c.warn ? { color: "var(--danger)", background: "var(--danger-soft)" } : void 0 }, /* @__PURE__ */ React.createElement(Icon, { name: c.icon, size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "kpi-body" }, /* @__PURE__ */ React.createElement("div", { className: "stat-num" }, c.v)), /* @__PURE__ */ React.createElement("div", { className: "kpi-foot" }, /* @__PURE__ */ React.createElement("span", { className: "trunc" }, c.f))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 12, marginTop: 13 } }, /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "row", style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("rev_by_hour")), /* @__PURE__ */ React.createElement("div", { className: "money-lg", style: { fontSize: 21, marginTop: 2 } }, summ(total), " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, fontFamily: "var(--f-body)", fontWeight: 600, color: "var(--text-3)" } }, "\u0441\u0443\u043C"))), /* @__PURE__ */ React.createElement("span", { className: "grow" }), /* @__PURE__ */ React.createElement("div", { className: "row", style: { gap: 10, fontSize: 9.5 } }, /* @__PURE__ */ React.createElement("span", { className: "row", style: { gap: 4, color: "var(--text-2)" } }, /* @__PURE__ */ React.createElement("span", { style: { width: 14, height: 2, background: "var(--accent)", display: "block", borderRadius: 2 } }), "\u0421\u0435\u0433\u043E\u0434\u043D\u044F"))), /* @__PURE__ */ React.createElement(
    LineChart,
    {
      labels: hours,
      series: [
        { data: realHourly, color: "var(--accent)", fill: true }
      ],
      height: 168
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("kitchen_load")), /* @__PURE__ */ React.createElement("div", { className: "dim", style: { fontSize: 10, marginTop: 2, marginBottom: 11 } }, orders.filter((o) => o.col === "kitchen").length, " \u0433\u043E\u0442\u043E\u0432\u044F\u0442\u0441\u044F \xB7 ", orders.filter((o) => o.col === "way").length, " \u043D\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0435"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 13, paddingTop: 11, borderTop: "1px solid var(--line-soft)" } }, /* @__PURE__ */ React.createElement("div", { className: "label" }, t("top_items")), /* @__PURE__ */ React.createElement("div", { className: "col-flex", style: { marginTop: 7, gap: 6 } }, topList.map(([n, v]) => /* @__PURE__ */ React.createElement("div", { key: n, className: "row", style: { gap: 7, fontSize: 10.5 } }, /* @__PURE__ */ React.createElement("span", { className: "grow trunc" }, n), /* @__PURE__ */ React.createElement("div", { style: { width: 52, height: 4, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: v / maxTop * 100 + "%", height: "100%", background: "var(--accent)", opacity: 0.8 } })), /* @__PURE__ */ React.createElement("span", { className: "mono dim", style: { fontSize: 9, width: 16, textAlign: "right" } }, v))), !topList.length && /* @__PURE__ */ React.createElement("div", { className: "dim", style: { fontSize: 11 } }, "\u0417\u0430\u043A\u0430\u0437\u043E\u0432 \u0441 \u043F\u043E\u0437\u0438\u0446\u0438\u044F\u043C\u0438 \u043C\u0435\u043D\u044E \u043F\u043E\u043A\u0430 \u043D\u0435\u0442"))))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 12 } }, [
    { l: "delivery", v: delCount, c: "var(--info)", f: `${Math.round(delCount / safeTotal * 100)}% \u0432\u0441\u0435\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432` },
    { l: "pickup", v: pickCount, c: "var(--warn)", f: `${Math.round(pickCount / safeTotal * 100)}% \u0432\u0441\u0435\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432` },
    { l: "hall", v: hallCount, c: "var(--violet)", f: `${Math.round(hallCount / safeTotal * 100)}% \u0432\u0441\u0435\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432` }
  ].map((s) => /* @__PURE__ */ React.createElement("div", { key: s.l, className: "card", style: { padding: 13 } }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("span", { className: "label" }, t(s.l)), /* @__PURE__ */ React.createElement("span", { className: "grow" }), /* @__PURE__ */ React.createElement("span", { className: "stat-num", style: { fontSize: 18, color: s.c } }, s.v)), /* @__PURE__ */ React.createElement("div", { className: "dim trunc", style: { fontSize: 10, marginTop: 4 } }, s.f)))));
}
function Settings({ t, theme, setTheme, dir, setDir, lang, setLang, sound, setSound, rail, setRail }) {
  const THEME_LABELS = { gold: "\u0422\u0451\u043C\u043D\u043E\u0435 \u0437\u043E\u043B\u043E\u0442\u043E", graphite: "\u0413\u0440\u0430\u0444\u0438\u0442", oxblood: "\u041E\u043A\u0441\u0431\u043B\u0430\u0434", cream: "\u041A\u0440\u0435\u043C" };
  return /* @__PURE__ */ React.createElement("div", { className: "page", style: { maxWidth: 980 } }, /* @__PURE__ */ React.createElement("div", { className: "sect-title" }, t("appearance_lbl")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 14, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "label", style: { marginBottom: 9 } }, t("themes")), /* @__PURE__ */ React.createElement("div", { className: "theme-grid" }, THEMES.map((th) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: th.id,
      onClick: () => setTheme(th.id),
      style: {
        padding: 0,
        border: "1.5px solid " + (theme === th.id ? "var(--accent)" : "var(--line)"),
        borderRadius: "var(--r-sm)",
        overflow: "hidden",
        background: "none",
        boxShadow: theme === th.id ? "0 0 0 3px var(--accent-soft)" : "none",
        transition: "all var(--dur)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { height: 52, background: THEME_SWATCH[th.id].bg, display: "flex", padding: 6, gap: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { width: 13, background: THEME_SWATCH[th.id].s1, borderRadius: 2 } }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", gap: 3 } }, /* @__PURE__ */ React.createElement("div", { style: { height: 8, background: THEME_SWATCH[th.id].s1, borderRadius: 2, width: "45%" } }), /* @__PURE__ */ React.createElement("div", { style: {
      flex: 1,
      background: THEME_SWATCH[th.id].s2,
      borderRadius: 2,
      borderTop: "2px solid " + THEME_SWATCH[th.id].accent
    } }), /* @__PURE__ */ React.createElement("div", { style: { height: 4, background: THEME_SWATCH[th.id].accent, borderRadius: 2, width: "30%" } }))),
    /* @__PURE__ */ React.createElement("div", { style: {
      padding: "6px 8px",
      fontSize: 10,
      fontWeight: 600,
      textAlign: "left",
      color: theme === th.id ? "var(--accent)" : "var(--text-2)"
    } }, THEME_LABELS[th.id])
  ))), /* @__PURE__ */ React.createElement("div", { className: "label", style: { margin: "16px 0 9px" } }, t("dirs")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 } }, DIRECTIONS.map((d) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: d.id,
      onClick: () => setDir(d.id),
      style: {
        textAlign: "left",
        padding: "10px 11px",
        border: "1.5px solid " + (dir === d.id ? "var(--accent)" : "var(--line)"),
        borderRadius: "var(--r-sm)",
        background: dir === d.id ? "var(--accent-soft)" : "var(--surface-2)",
        transition: "all var(--dur)"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: {
      width: 18,
      height: 18,
      display: "grid",
      placeItems: "center",
      flex: "none",
      fontFamily: d.id === "a" ? "var(--f-display)" : d.id === "b" ? "var(--f-body)" : "var(--f-mono)",
      fontSize: 11,
      fontWeight: 700,
      borderRadius: d.id === "a" ? 4 : d.id === "b" ? 6 : 2,
      background: dir === d.id ? "var(--accent)" : "var(--surface-3)",
      color: dir === d.id ? "var(--accent-ink)" : "var(--text-2)"
    } }, "Aa"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700 } }, d.label)),
    /* @__PURE__ */ React.createElement("div", { className: "dim", style: { fontSize: 9.5, marginTop: 5, lineHeight: 1.4 } }, d.note)
  )))), /* @__PURE__ */ React.createElement("div", { className: "sect-title" }, t("ops_prefs")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement(SettingRow, { label: t("language_lbl"), hint: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439 \xB7 O\u2018zbekcha \xB7 \u040E\u0437\u0431\u0435\u043A\u0447\u0430" }, /* @__PURE__ */ React.createElement("div", { className: "seg" }, [["ru", "RU"], ["uz", "UZ"], ["uzc", "\u040E\u0417"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, "data-on": lang === k ? "1" : "0", onClick: () => setLang(k), style: { fontFamily: "var(--f-mono)", fontSize: 10 } }, l)))), /* @__PURE__ */ React.createElement(SettingRow, { label: t("sound"), hint: "\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0441\u0438\u0433\u043D\u0430\u043B, \u043A\u043E\u0433\u0434\u0430 \u0437\u0430\u043A\u0430\u0437 \u0432\u044B\u0445\u043E\u0434\u0438\u0442 \u0437\u0430 SLA" }, /* @__PURE__ */ React.createElement(Toggle, { on: sound, onChange: setSound })), /* @__PURE__ */ React.createElement(SettingRow, { label: t("escalate"), hint: "\u041F\u043E\u0434\u0441\u0432\u0435\u0447\u0438\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438 \u043A\u0440\u0430\u0441\u043D\u044B\u043C \u0438 \u043F\u043E\u0434\u043D\u0438\u043C\u0430\u0442\u044C \u0432\u0432\u0435\u0440\u0445" }, /* @__PURE__ */ React.createElement(Toggle, { on: true, onChange: () => {
  } })), /* @__PURE__ */ React.createElement(SettingRow, { label: t("rail"), hint: "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043B\u0435\u0432\u043E\u0435 \u043C\u0435\u043D\u044E \u0434\u043E \u0438\u043A\u043E\u043D\u043E\u043A" }, /* @__PURE__ */ React.createElement(Toggle, { on: rail, onChange: setRail })), /* @__PURE__ */ React.createElement(SettingRow, { label: "\u0410\u0432\u0442\u043E\u043F\u0435\u0447\u0430\u0442\u044C \u0447\u0435\u043A\u043E\u0432", hint: "\u041F\u0435\u0447\u0430\u0442\u0430\u0442\u044C \u0444\u0438\u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0447\u0435\u043A \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0435 \u0432 \xAB\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E\xBB" }, /* @__PURE__ */ React.createElement(Toggle, { on: false, onChange: () => {
  } }))), /* @__PURE__ */ React.createElement("div", { className: "sect-title", style: { marginTop: 16 } }, "\u0424\u0438\u043B\u0438\u0430\u043B"), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, [["\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", "FENIX RESTORAN"], ["\u0418\u041D\u041D", FX.restaurant.inn], ["\u0410\u0434\u0440\u0435\u0441", FX.restaurant.address], ["\u0422\u0435\u043B\u0435\u0444\u043E\u043D", FX.restaurant.phone]].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k }, /* @__PURE__ */ React.createElement("div", { className: "label" }, k), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, marginTop: 3, color: "var(--text-2)" } }, v))))));
}
const THEME_SWATCH = {
  gold: { bg: "#0b0a08", s1: "#1e1b13", s2: "#12110d", accent: "#d3aa63" },
  graphite: { bg: "#0c0f13", s1: "#1d232c", s2: "#12161c", accent: "#78a6dc" },
  oxblood: { bg: "#100a0b", s1: "#251a1b", s2: "#171011", accent: "#dd9a72" },
  cream: { bg: "#f4f0e6", s1: "#eae2cf", s2: "#fffdf8", accent: "#9a6f1e" }
};
function SettingRow({ label, hint, children }) {
  return /* @__PURE__ */ React.createElement("div", { className: "row", style: { padding: "11px 14px", borderBottom: "1px solid var(--line-soft)", gap: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "grow" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 600 } }, label), hint && /* @__PURE__ */ React.createElement("div", { className: "dim", style: { fontSize: 10, marginTop: 1 } }, hint)), children);
}
function Toggle({ on, onChange }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => onChange(!on),
      role: "switch",
      "aria-checked": on,
      style: {
        width: 34,
        height: 19,
        borderRadius: 99,
        border: 0,
        padding: 2,
        flex: "none",
        background: on ? "var(--accent)" : "var(--surface-hi)",
        display: "flex",
        justifyContent: on ? "flex-end" : "flex-start",
        transition: "all .18s var(--ease)"
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: { width: 15, height: 15, borderRadius: 50, background: on ? "var(--accent-ink)" : "var(--text-3)", display: "block" } })
  );
}
Object.assign(window, { Analytics, Settings, SettingRow, Toggle, THEME_SWATCH });
function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setError("\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F");
      return;
    }
    if (!password.trim()) {
      setError("\u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u0432\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        const token = data.token;
        if (remember) {
          localStorage.setItem("fenix_admin_auth", token);
        } else {
          sessionStorage.setItem("fenix_admin_auth", token);
        }
        document.cookie = `fenix_admin_auth=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
        if (onLoginSuccess) {
          onLoginSuccess(token, data.user);
        }
      } else {
        setError(data.error || "\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0438\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C");
      }
    } catch (err) {
      setError("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u0432\u044F\u0437\u0438 \u0441 \u0441\u0435\u0440\u0432\u0435\u0440\u043E\u043C. \u0423\u0431\u0435\u0434\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E \u0441\u0435\u0440\u0432\u0435\u0440 \u0437\u0430\u043F\u0443\u0449\u0435\u043D.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at 50% 25%, rgba(211, 170, 99, 0.16) 0%, rgba(14, 13, 10, 0.96) 65%, #070605 100%)",
    fontFamily: 'var(--f-body, "Manrope", system-ui, sans-serif)',
    color: "var(--text, #f2ebdc)",
    padding: "20px",
    overflowY: "auto"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: "15%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "500px",
    height: "350px",
    background: "radial-gradient(circle, rgba(211, 170, 99, 0.12) 0%, transparent 70%)",
    filter: "blur(50px)",
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    width: "100%",
    maxWidth: "430px",
    background: "rgba(18, 17, 13, 0.88)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(211, 170, 99, 0.3)",
    borderRadius: "20px",
    boxShadow: "0 32px 80px -16px rgba(0, 0, 0, 0.9), 0 0 40px -10px rgba(211, 170, 99, 0.18)",
    padding: "38px 32px 32px",
    boxSizing: "border-box"
  } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: "28px" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "60px",
    height: "60px",
    margin: "0 auto 16px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, rgba(211, 170, 99, 0.28) 0%, rgba(211, 170, 99, 0.08) 100%)",
    border: "1px solid rgba(211, 170, 99, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(211, 170, 99, 0.2)"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "flame", size: 30, stroke: 1.8, style: { color: "var(--accent, #d3aa63)" } })), /* @__PURE__ */ React.createElement("h1", { style: {
    margin: "0 0 6px",
    fontFamily: 'var(--f-body, "Manrope", system-ui, sans-serif)',
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "var(--accent-2, #efd9a8)",
    textTransform: "uppercase",
    lineHeight: 1
  } }, "FENIX"), /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: 'var(--f-mono, "JetBrains Mono", monospace)',
    fontSize: "11px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--accent, #d3aa63)",
    opacity: 0.9,
    marginBottom: "10px"
  } }, "Restobar & Lounge \xB7 Dispatch OS"), /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(211, 170, 99, 0.08)",
    border: "1px solid rgba(211, 170, 99, 0.18)",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    color: "var(--text-2, #a99f8b)"
  } }, /* @__PURE__ */ React.createElement("span", { style: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#57a877",
    boxShadow: "0 0 8px #57a877"
  } }), "\u0421\u043B\u0443\u0436\u0435\u0431\u043D\u044B\u0439 \u0432\u0445\u043E\u0434 \u0434\u043B\u044F \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0430")), error && /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(213, 97, 79, 0.15)",
    border: "1px solid rgba(213, 97, 79, 0.45)",
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "20px",
    fontSize: "13px",
    color: "#ff9d91"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "alert", size: 17, stroke: 1.8, style: { flexShrink: 0, color: "#ff6e5a" } }), /* @__PURE__ */ React.createElement("span", null, error)), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, style: { display: "flex", flexDirection: "column", gap: "18px" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-2, #a99f8b)",
    marginBottom: "8px"
  } }, "\u0418\u043C\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-3, #6f6656)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "users", size: 16 })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: username,
      onChange: (e) => setUsername(e.target.value),
      autoComplete: "username",
      placeholder: "admin",
      autoFocus: true,
      style: {
        width: "100%",
        height: "46px",
        background: "rgba(8, 7, 5, 0.7)",
        border: "1px solid rgba(201, 168, 106, 0.22)",
        borderRadius: "10px",
        padding: "0 14px 0 42px",
        color: "var(--text, #f2ebdc)",
        fontSize: "14px",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease"
      },
      onFocus: (e) => {
        e.target.style.borderColor = "var(--accent, #d3aa63)";
        e.target.style.boxShadow = "0 0 12px rgba(211, 170, 99, 0.2)";
      },
      onBlur: (e) => {
        e.target.style.borderColor = "rgba(201, 168, 106, 0.22)";
        e.target.style.boxShadow = "none";
      }
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { style: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-2, #a99f8b)",
    marginBottom: "8px"
  } }, "\u041F\u0430\u0440\u043E\u043B\u044C \u0434\u043E\u0441\u0442\u0443\u043F\u0430"), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-3, #6f6656)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none"
  } }, /* @__PURE__ */ React.createElement(Icon, { name: "lock", size: 16 })), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: showPassword ? "text" : "password",
      value: password,
      onChange: (e) => setPassword(e.target.value),
      autoComplete: "current-password",
      placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
      style: {
        width: "100%",
        height: "46px",
        background: "rgba(8, 7, 5, 0.7)",
        border: "1px solid rgba(201, 168, 106, 0.22)",
        borderRadius: "10px",
        padding: "0 44px 0 42px",
        color: "var(--text, #f2ebdc)",
        fontSize: "14px",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease"
      },
      onFocus: (e) => {
        e.target.style.borderColor = "var(--accent, #d3aa63)";
        e.target.style.boxShadow = "0 0 12px rgba(211, 170, 99, 0.2)";
      },
      onBlur: (e) => {
        e.target.style.borderColor = "rgba(201, 168, 106, 0.22)";
        e.target.style.boxShadow = "none";
      }
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowPassword(!showPassword),
      title: showPassword ? "\u0421\u043A\u0440\u044B\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C" : "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C",
      style: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        color: "var(--text-3, #6f6656)",
        cursor: "pointer",
        padding: "6px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "6px"
      },
      onMouseOver: (e) => e.currentTarget.style.color = "var(--text, #f2ebdc)",
      onMouseOut: (e) => e.currentTarget.style.color = "var(--text-3, #6f6656)"
    },
    /* @__PURE__ */ React.createElement(Icon, { name: showPassword ? "eyeOff" : "eye", size: 16 })
  ))), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "var(--text-2, #a99f8b)"
  } }, /* @__PURE__ */ React.createElement("label", { style: { display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer" } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: remember,
      onChange: (e) => setRemember(e.target.checked),
      style: { accentColor: "var(--accent, #d3aa63)", cursor: "pointer" }
    }
  ), /* @__PURE__ */ React.createElement("span", null, "\u0417\u0430\u043F\u043E\u043C\u043D\u0438\u0442\u044C \u043D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: loading,
      style: {
        height: "48px",
        borderRadius: "10px",
        border: "none",
        background: "linear-gradient(135deg, #d3aa63 0%, #b8860b 100%)",
        color: "#0e0b04",
        fontFamily: "inherit",
        fontSize: "14px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        cursor: loading ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        boxShadow: "0 8px 24px rgba(211, 170, 99, 0.28)",
        transition: "transform 0.18s ease, filter 0.18s ease",
        marginTop: "6px"
      },
      onMouseOver: (e) => {
        if (!loading) e.currentTarget.style.filter = "brightness(1.1)";
      },
      onMouseOut: (e) => {
        e.currentTarget.style.filter = "none";
      }
    },
    loading ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Icon, { name: "loop", size: 16, style: { animation: "spin 1s linear infinite" } }), /* @__PURE__ */ React.createElement("span", null, "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u0430\u2026")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", null, "\u0412\u043E\u0439\u0442\u0438 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0443"), /* @__PURE__ */ React.createElement(Icon, { name: "chevronR", size: 16, stroke: 2.2 }))
  ))));
}
window.LoginScreen = LoginScreen;
const TWEAK_DEFAULTS = (
  /*EDITMODE-BEGIN*/
  {
    "theme": "gold",
    "dir": "a",
    "density": "balanced",
    "lang": "ru",
    "rail": false,
    "sound": true,
    "accentOverride": ""
  }
);
const ACCENTS = {
  gold: [["", "\u0417\u043E\u043B\u043E\u0442\u043E"], ["#b98d4a", "\u041C\u0435\u0434\u044C"], ["#9aa87a", "\u0428\u0430\u043B\u0444\u0435\u0439"], ["#c98b7a", "\u0422\u0435\u0440\u0440\u0430\u043A\u043E\u0442\u0430"], ["#8fa4cd", "\u0421\u0442\u0430\u043B\u044C"]],
  graphite: [["", "\u0421\u0442\u0430\u043B\u044C"], ["#6fb3a8", "\u0422\u0438\u043B"], ["#b6a3d8", "\u041B\u0430\u0432\u0430\u043D\u0434\u0430"], ["#d3a04b", "\u042F\u043D\u0442\u0430\u0440\u044C"], ["#d97f8e", "\u0420\u043E\u0437\u0430"]],
  oxblood: [["", "\u041C\u0435\u0434\u044C"], ["#d9b06a", "\u041B\u0430\u0442\u0443\u043D\u044C"], ["#a8b88d", "\u041E\u043B\u0438\u0432\u0430"], ["#c98fa8", "\u041F\u044B\u043B\u044C\u043D\u0430\u044F \u0440\u043E\u0437\u0430"], ["#8fa0c4", "\u0421\u043B\u0435\u0439\u0442"]],
  cream: [["", "\u041E\u0445\u0440\u0430"], ["#8a5a2b", "\u0421\u0435\u043F\u0438\u044F"], ["#4a6b52", "\u041C\u043E\u0445"], ["#3a5f96", "\u0418\u043D\u0434\u0438\u0433\u043E"], ["#8c4a52", "\u0411\u043E\u0440\u0434\u043E"]]
};
function mapBackendStatusToCol(status) {
  if (!status) return "new";
  const s = String(status).toLowerCase();
  if (s.includes("\u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D") || s.includes("\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D") || s.includes("\u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D") || s === "done") return "done";
  if (s.includes("\u043F\u0443\u0442\u0438") || s.includes("\u0432\u044B\u0434\u0430\u0447\u0435") || s === "way") return "way";
  if (s.includes("\u043A\u0443\u0445\u043D") || s.includes("\u0433\u043E\u0442\u043E\u0432") || s === "kitchen") return "kitchen";
  return "new";
}
function mapOrderType(typeStr, addrStr) {
  const s = (String(typeStr) + " " + String(addrStr)).toLowerCase();
  if (s.includes("\u0441\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437") || s.includes("pickup")) return "pickup";
  if (s.includes("\u0437\u0430\u043B") || s.includes("\u0441\u0442\u043E\u043B") || s.includes("hall")) return "hall";
  return "delivery";
}
const KNOWN_ID_MAP = {
  es_1: { n: "\u0421\u0435\u043B\u0451\u0434\u043A\u0430 \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u043E\u043D\u043D\u0430\u044F", p: 85e3 },
  es_2: { n: "\u0425\u043E\u043B\u043E\u0434\u0435\u0446", p: 75e3 },
  es_3: { n: "\u041E\u0432\u043E\u0449\u043D\u0430\u044F \u043D\u0430\u0440\u0435\u0437\u043A\u0430", p: 75e3 },
  es_4: { n: "\u041C\u0430\u0440\u0438\u043D\u043E\u0432\u0430\u043D\u043D\u043E\u0435 \u0430\u0441\u0441\u043E\u0440\u0442\u0438", p: 75e3 },
  es_5: { n: "\u0421\u0435\u043B\u044C\u0434\u0435\u0440\u0435\u0439 \u0441 \u043C\u044F\u0441\u043E\u043C", p: 185e3 },
  esa_6: { n: "\u0413\u0440\u0435\u0447\u0435\u0441\u043A\u0438\u0439 \u0441\u0430\u043B\u0430\u0442", p: 89e3 },
  esa_7: { n: "\u0425\u0440\u0443\u0441\u0442\u044F\u0449\u0438\u0435 \u0431\u0430\u043A\u043B\u0430\u0436\u0430\u043D\u044B", p: 89e3 },
  esa_8: { n: "\u0421\u0430\u043B\u0430\u0442 \xAB\u0417\u0430\u043A\u0443\u0441\u043E\u0447\u043D\u044B\u0439\xBB", p: 85e3 },
  esa_9: { n: "\u0418\u0442\u0430\u043B\u044C\u044F\u043D\u0441\u043A\u0438\u0439 VERDE", p: 89e3 },
  esa_10: { n: "\u0426\u0435\u0437\u0430\u0440\u044C \u0441 \u043A\u0443\u0440\u0438\u0446\u0435\u0439", p: 85e3 },
  em_1: { n: "\u0421\u0442\u0435\u0439\u043A \u041C\u0435\u0434\u0430\u043B\u044C\u043E\u043D", p: 285e3 },
  em_2: { n: "\u0421\u0442\u0435\u0439\u043A \u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439", p: 299e3 },
  em_3: { n: "\u0421\u0442\u0435\u0439\u043A \u041C\u0438\u043D\u044C\u043E\u043D", p: 29e4 },
  em_4: { n: "\u0421\u0442\u0435\u0439\u043A \u0420\u0438\u0431\u0430\u0439", p: 375e3 },
  sh_9: { n: "\u0424\u043E\u0440\u0435\u043B\u044C \u043D\u0430 \u0433\u0440\u0438\u043B\u0435", p: 185e3 },
  sh_10: { n: "\u0421\u043A\u0443\u043C\u0431\u0440\u0438\u044F \u043D\u0430 \u0433\u0440\u0438\u043B\u0435", p: 12e4 },
  sh_11: { n: "\u041E\u0432\u043E\u0449\u0438 \u043D\u0430 \u043C\u0430\u043D\u0433\u0430\u043B\u0435", p: 75e3 },
  sh_12: { n: "\u0413\u0440\u0438\u0431\u044B \u043D\u0430 \u043C\u0430\u043D\u0433\u0430\u043B\u0435", p: 99e3 },
  ka_1: { n: "\u041A\u0438\u043C-\u043F\u0430\u0431 \u0441 \u0441\u0451\u043C\u0433\u043E\u0439", p: 79e3 },
  ka_2: { n: "\u041A\u0438\u043C-\u043F\u0430\u0431 \u0441 \u043C\u044F\u0441\u043E\u043C", p: 75e3 },
  ka_3: { n: "\u041A\u0438\u043C-\u043F\u0430\u0431 \u0441 \u043A\u0440\u0435\u0432\u0435\u0442\u043A\u0430\u043C\u0438", p: 85e3 },
  ka_4: { n: "\u041A\u0438\u043C-\u043F\u0430\u0431 \u0441 \u043A\u0440\u0430\u0431\u043E\u0432\u044B\u043C\u0438 \u043F\u0430\u043B\u043E\u0447\u043A\u0430\u043C\u0438", p: 65e3 },
  ka_5: { n: "\u0427\u0430\u043F\u0447\u0435", p: 75e3 },
  ks_1: { n: "\u041A\u043E\u0441\u0430\u0440\u0438", p: 119e3 },
  ks_2: { n: "\u041C\u0435\u0433\u0438\u0447\u0430", p: 69e3 },
  ks_3: { n: "\u0427\u0443\u043A\u0430 \u0441\u0430\u043B\u0430\u0442", p: 99e3 },
  ks_4: { n: "\u0412\u0435-\u0447\u0430", p: 69e3 },
  km_1: { n: "\u0421\u0430\u043C\u0433\u0435\u043F\u0441\u0430\u043B\u044C", p: 2e5 },
  km_2: { n: "\u041C\u043E\u043A\u0441\u0430\u043B\u044C", p: 24e4 },
  km_3: { n: "\u0422\u0451\u043A-\u043F\u0430\u043B\u044C", p: 475e3 }
};
function parseOrderItems(raw) {
  if (!raw) return [{ n: "\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0437", q: 1, p: 0 }];
  if (Array.isArray(raw)) {
    return raw.map((it) => {
      const idKey = it.id || it.n;
      const known = KNOWN_ID_MAP[idKey];
      return {
        n: known ? known.n : it.n || it.name || "\u0411\u043B\u044E\u0434\u043E",
        q: it.q || it.quantity || it.count || 1,
        p: it.p || it.price || (known ? known.p : 0)
      };
    });
  }
  if (typeof raw === "object") {
    const list = Object.entries(raw).map(([n, q]) => {
      const known = KNOWN_ID_MAP[n];
      const isObj = typeof q === "object" && q !== null;
      return {
        n: known ? known.n : n,
        q: isObj ? q.qty || q.count || 1 : typeof q === "number" ? q : 1,
        p: isObj ? q.price || 0 : known ? known.p : 0
      };
    });
    if (list.length) return list;
  }
  return [{ n: "\u0417\u0430\u043A\u0430\u0437 \u043F\u043E \u043C\u0435\u043D\u044E", q: 1, p: 0 }];
}
if (typeof window !== "undefined" && !window.__fetchInterceptorInstalled) {
  window.__fetchInterceptorInstalled = true;
  const origFetch = window.fetch;
  window.fetch = function(input, init = {}) {
    try {
      const token = localStorage.getItem("fenix_admin_auth") || sessionStorage.getItem("fenix_admin_auth");
      if (token && typeof input === "string" && input.startsWith("/api/admin/")) {
        init = Object.assign({}, init);
        init.headers = Object.assign({}, init.headers || {}, { "X-Admin-Key": token });
      }
    } catch (_) {
    }
    return origFetch.call(this, input, init);
  };
}
function SwitchOperatorModal({ isOpen, onClose, currentUser, onSelectUser, toast }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/admin/staff").then((res) => res.json()).then((data) => {
        if (data && data.ok && Array.isArray(data.staff)) {
          setStaffList(data.staff);
        }
      }).catch(() => {
      }).finally(() => setLoading(false));
    }
  }, [isOpen]);
  if (!isOpen) return null;
  const defaultAdmin = { user_id: "admin", full_name: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 Fenix", role: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440", status: "online" };
  const allOperators = [defaultAdmin, ...staffList.filter((s) => s.full_name !== "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 Fenix")];
  return /* @__PURE__ */ React.createElement("div", { className: "scrim", onClick: onClose, style: { display: "flex", alignItems: "center", justifyContent: "center", zIndex: 120 } }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "card",
      onClick: (e) => e.stopPropagation(),
      style: {
        width: 500,
        maxWidth: "95vw",
        maxHeight: "85vh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        overflow: "hidden",
        background: "var(--surface-2)",
        border: "1px solid var(--line-strong)",
        boxShadow: "var(--shadow-pop)",
        borderRadius: 14
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      padding: "16px 20px",
      borderBottom: "1px solid var(--line)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "var(--surface)"
    } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 700, color: "var(--text)" } }, "\u0414\u0435\u0436\u0443\u0440\u043D\u044B\u0439 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440 \u0441\u043C\u0435\u043D\u044B"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-3)", marginTop: 2 } }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0430, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0441\u0435\u0439\u0447\u0430\u0441 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0437\u0430 \u043F\u0443\u043B\u044C\u0442\u043E\u043C \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0430")), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "btn btn-sm btn-ghost",
        onClick: onClose,
        style: { width: 32, height: 32, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }
      },
      /* @__PURE__ */ React.createElement(Icon, { name: "x", size: 14 })
    )),
    /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, flex: 1 } }, loading && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "24px 0", color: "var(--text-3)", fontSize: 12 } }, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u043F\u0438\u0441\u043A\u0430 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0430..."), !loading && allOperators.map((s) => {
      const isCurrent = currentUser?.user_id && String(currentUser.user_id) === String(s.user_id) || currentUser?.name === s.full_name;
      const inits = s.full_name ? s.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "??";
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: s.user_id || s.full_name,
          onClick: () => {
            onSelectUser({
              user_id: s.user_id,
              name: s.full_name,
              full_name: s.full_name,
              role: s.role,
              initials: inits
            });
            onClose();
            toast && toast(`\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440 \u0438\u0437\u043C\u0435\u043D\u0451\u043D \u043D\u0430 "${s.full_name}"`, "ok", "users");
          },
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: 8,
            border: isCurrent ? "1px solid var(--accent)" : "1px solid var(--line)",
            background: isCurrent ? "rgba(211, 170, 99, 0.12)" : "var(--surface)",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("span", { className: "avatar", "data-tone": isCurrent ? "accent" : "muted" }, inits), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, color: isCurrent ? "var(--accent-2)" : "var(--text)", fontSize: 13 } }, s.full_name), /* @__PURE__ */ React.createElement("div", { className: "dim mono", style: { fontSize: 11 } }, s.role, " ", s.user_name ? `(@${s.user_name})` : ""))),
        /* @__PURE__ */ React.createElement("div", null, isCurrent ? /* @__PURE__ */ React.createElement(Pill, { tone: "accent", dot: true }, "\u0410\u043A\u0442\u0438\u0432\u0435\u043D") : /* @__PURE__ */ React.createElement(Pill, { tone: s.status === "online" ? "ok" : "muted" }, s.status === "online" ? "\u041D\u0430 \u0441\u043C\u0435\u043D\u0435" : "\u0412\u044B\u0445\u043E\u0434\u043D\u043E\u0439"))
      );
    }))
  ));
}
function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const theme = tw.theme, dir = tw.dir, lang = tw.lang;
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)fenix_admin_auth=([^;]+)/);
      if (match) return true;
      return Boolean(localStorage.getItem("fenix_admin_auth") || sessionStorage.getItem("fenix_admin_auth"));
    } catch (_) {
      return false;
    }
  });
  const [page, setPage] = useState(() => {
    try {
      return localStorage.getItem("fx.page") || "dispatch";
    } catch (e) {
      return "dispatch";
    }
  });
  const [view, setView] = useState(() => {
    try {
      return localStorage.getItem("fx.view") || "board";
    } catch (e) {
      return "board";
    }
  });
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [cmdk, setCmdk] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, pushToast] = useToasts();
  const now = useTick(1e3);
  const seenOrderIds = useRef(/* @__PURE__ */ new Set());
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("fenix_current_user");
      if (saved) return JSON.parse(saved);
    } catch (_) {
    }
    return { user_id: "admin", name: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 Fenix", role: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440", initials: "\u0410\u0414" };
  });
  const [switchUserModalOpen, setSwitchUserModalOpen] = useState(false);
  const t = useCallback((k) => FX_I18N[lang] && FX_I18N[lang][k] || (FX_I18N.ru[k] || k), [lang]);
  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (_) {
    }
    try {
      localStorage.removeItem("fenix_admin_auth");
      sessionStorage.removeItem("fenix_admin_auth");
      document.cookie = "fenix_admin_auth=; path=/; max-age=0; SameSite=Lax";
    } catch (_) {
    }
    setIsAuthenticated(false);
    pushToast("\u0412\u044B \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0432\u044B\u0448\u043B\u0438 \u0438\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u044B", "info", "logOut");
  }, [pushToast]);
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d && d.authenticated) {
        setIsAuthenticated(true);
      } else {
        const localToken = localStorage.getItem("fenix_admin_auth") || sessionStorage.getItem("fenix_admin_auth");
        if (!localToken) setIsAuthenticated(false);
      }
    }).catch(() => {
    });
  }, []);
  const syncOrders = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch("/api/admin/orders");
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
          const createdTs = r.createdAt ? new Date(r.createdAt.replace(" ", "T")).getTime() : Date.now();
          const elapsed = Math.max(1, Math.round((Date.now() - createdTs) / 6e4));
          const items = parseOrderItems(r.items);
          const itemsTotal = items.reduce((sum, it) => sum + Number(it.p || 0) * Number(it.q || 1), 0);
          const fee = type === "delivery" ? itemsTotal >= 25e4 && itemsTotal > 0 ? 0 : 2e4 : 0;
          const id = r.code || `WEB-${r.orderNum || r.id}`;
          return {
            id,
            orderNum: r.orderNum,
            dbId: r.id,
            type,
            col,
            client: r.customerName || "\u041A\u043B\u0438\u0435\u043D\u0442",
            phone: r.customerPhone || "\u2014",
            addr: type === "delivery" ? r.address || "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" : void 0,
            table: type === "hall" ? r.address || "\u0421\u0442\u043E\u043B \u0432 \u0437\u0430\u043B\u0435" : void 0,
            elapsed: isNaN(elapsed) ? 3 : elapsed,
            sla: type === "delivery" ? 45 : 25,
            pay: (r.paymentMethod || "").toLowerCase().includes("\u043D\u0430\u043B\u0438\u0447") ? "cash" : "card",
            note: "",
            items,
            fee,
            total: r.totalPrice || (itemsTotal > 0 ? itemsTotal + fee : 12e4),
            createdAt: createdTs,
            isBackend: true,
            courier: r.courier || r.courierName || void 0,
            courierId: r.courierId || void 0
          };
        });
        if (!isInitial) {
          mapped.forEach((o) => {
            if (!seenOrderIds.current.has(o.id)) {
              seenOrderIds.current.add(o.id);
              if (tw.sound) beep("alert");
              pushToast(`\u041D\u043E\u0432\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 #${o.id}!`, "ok", "dpad");
            }
          });
        } else {
          mapped.forEach((o) => seenOrderIds.current.add(o.id));
        }
        setOrders(mapped);
      }
    } catch (e) {
      console.error("Error syncing orders:", e);
    }
  }, [pushToast, tw.sound]);
  const syncBookingsCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reservations");
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.reservations)) {
        setBookingsCount(data.reservations.length);
      }
    } catch (_) {
    }
  }, []);
  useEffect(() => {
    syncOrders(true);
    syncBookingsCount();
    const interval = setInterval(() => {
      syncOrders(false);
      syncBookingsCount();
    }, 6e3);
    return () => clearInterval(interval);
  }, [syncOrders, syncBookingsCount]);
  useEffect(() => {
    try {
      localStorage.setItem("fx.page", page);
    } catch (e) {
    }
  }, [page]);
  useEffect(() => {
    try {
      localStorage.setItem("fx.view", view);
    } catch (e) {
    }
  }, [view]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.dir = dir;
    document.documentElement.dataset.density = tw.density;
    document.documentElement.lang = lang === "ru" ? "ru" : "uz";
  }, [theme, dir, tw.density, lang]);
  useEffect(() => {
    const root = document.documentElement;
    if (tw.accentOverride) {
      root.style.setProperty("--accent", tw.accentOverride);
      root.style.setProperty("--accent-soft", tw.accentOverride + "22");
      root.style.setProperty("--accent-glow", tw.accentOverride + "38");
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-soft");
      root.style.removeProperty("--accent-glow");
    }
  }, [tw.accentOverride]);
  const latePrev = useRef(0);
  useEffect(() => {
    const late = orders.filter((o) => o.col !== "done" && slaState(o).late).length;
    if (late > latePrev.current && tw.sound) beep(late > latePrev.current + 1 ? "danger" : "alert");
    latePrev.current = late;
  }, [orders, tw.sound]);
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdk((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setCmdk(false);
        setOpenOrder(null);
        setPrintOrder(null);
        setCreateOpen(false);
      }
      if (["1", "2", "3", "4"].includes(e.key) && page === "dispatch") {
        const col = ["new", "kitchen", "way", "done"][Number(e.key) - 1];
        pushToast(t(COLUMNS.find((c) => c.id === col).label) + " \xB7 \u0444\u0438\u043B\u044C\u0442\u0440", "ok", "grid");
      }
      if (e.key === "g") setPage("dispatch");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, t, pushToast]);
  const advance = useCallback(async (o) => {
    const next = { new: "kitchen", kitchen: "way", way: "done", done: "done" }[o.col];
    const backendStatus = {
      kitchen: "\u0432 \u043A\u0443\u0445\u043D\u0435",
      way: o.type === "pickup" ? "\u0433\u043E\u0442\u043E\u0432 \u043A \u0432\u044B\u0434\u0430\u0447\u0435" : "\u0432 \u043F\u0443\u0442\u0438",
      done: "\u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D"
    }[next];
    setOrders(
      (list) => list.map(
        (x) => x.id === o.id ? { ...x, col: next, elapsed: next === "done" ? x.elapsed : x.elapsed } : x
      )
    );
    pushToast(`#${o.id} \u2192 ${t(COLUMNS.find((c) => c.id === next).label)}`, "ok", next === "done" ? "check" : "arrowRight");
    if (openOrder && openOrder.id === o.id) setOpenOrder({ ...openOrder, col: next });
    if (backendStatus) {
      try {
        await fetch("/api/admin/orders/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: o.dbId,
            orderNum: o.orderNum || parseInt(String(o.id).replace(/\D/g, "")),
            status: backendStatus
          })
        });
      } catch (e) {
        console.error("Error advancing order:", e);
      }
    }
  }, [t, pushToast, openOrder]);
  const dispatch = useCallback(async (action, o) => {
    if (action === "acceptAll") {
      const newOrders = orders.filter((x) => x.col === "new");
      setOrders((list) => list.map((x) => x.col === "new" ? { ...x, col: "kitchen" } : x));
      pushToast("\u0412\u0441\u0435 \u043D\u043E\u0432\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u044B \u043F\u0440\u0438\u043D\u044F\u0442\u044B", "ok", "check");
      for (const ord of newOrders) {
        try {
          await fetch("/api/admin/orders/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: ord.dbId,
              orderNum: ord.orderNum || parseInt(String(ord.id).replace(/\D/g, "")),
              status: "\u0432 \u043A\u0443\u0445\u043D\u0435"
            })
          });
        } catch (_) {
        }
      }
    } else if (action === "advance") advance(o);
    else if (action === "print") setPrintOrder(o);
  }, [advance, pushToast, orders]);
  const counts = { live: orders.filter((o) => o.col !== "done").length };
  const loaded = openOrder ? orders.find((o) => o.id === openOrder.id) || openOrder : null;
  const screens = {
    dispatch: /* @__PURE__ */ React.createElement(
      Dispatch,
      {
        t,
        orders,
        dispatch,
        view,
        setView,
        onOpen: setOpenOrder,
        onAdvance: (o) => advance(o),
        onPrint: setPrintOrder,
        toast: pushToast,
        lang,
        bookingsCount,
        onUpdateOrder: (updated) => setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o)),
        onDeleteOrder: (deletedId) => setOrders((prev) => prev.filter((o) => o.id !== deletedId))
      }
    ),
    bookings: /* @__PURE__ */ React.createElement(Bookings, { t, toast: pushToast }),
    banquets: /* @__PURE__ */ React.createElement(Banquets, { t, toast: pushToast }),
    floor: /* @__PURE__ */ React.createElement(Floor, { t, toast: pushToast }),
    couriers: /* @__PURE__ */ React.createElement(Couriers, { t, toast: pushToast, orders }),
    menu: /* @__PURE__ */ React.createElement(MenuScreen, { t, toast: pushToast }),
    staff: /* @__PURE__ */ React.createElement(Staff, { t, toast: pushToast }),
    analytics: /* @__PURE__ */ React.createElement(Analytics, { t, orders }),
    settings: /* @__PURE__ */ React.createElement(
      Settings,
      {
        t,
        theme,
        setTheme: (v) => setTweak("theme", v),
        dir,
        setDir: (v) => setTweak("dir", v),
        lang,
        setLang: (v) => setTweak("lang", v),
        sound: tw.sound,
        setSound: (v) => setTweak("sound", v),
        rail: tw.rail,
        setRail: (v) => setTweak("rail", v)
      }
    )
  };
  if (!isAuthenticated) {
    return /* @__PURE__ */ React.createElement(
      LoginScreen,
      {
        onLoginSuccess: (token, user) => {
          setIsAuthenticated(true);
          if (user) {
            const resolvedUser = {
              user_id: user.username || "admin",
              name: user.name || "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 Fenix",
              full_name: user.name || "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 Fenix",
              role: user.role || "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440",
              initials: initials(user.name || "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 Fenix")
            };
            setCurrentUser(resolvedUser);
            try {
              localStorage.setItem("fenix_current_user", JSON.stringify(resolvedUser));
            } catch (_) {
            }
          }
          pushToast(`\u0421 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435\u043C! \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 FENIX OS.`, "ok", "check");
        }
      }
    );
  }
  return /* @__PURE__ */ React.createElement("div", { className: "app", "data-rail": tw.rail ? "1" : "0" }, /* @__PURE__ */ React.createElement(
    Sidebar,
    {
      page,
      setPage: (p) => {
        setPage(p);
        setMobileMenuOpen(false);
      },
      rail: tw.rail,
      t,
      counts,
      onLogout: handleLogout,
      mobileOpen: mobileMenuOpen,
      onCloseMobile: () => setMobileMenuOpen(false),
      user: currentUser,
      onSwitchUser: () => setSwitchUserModalOpen(true)
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "main" }, /* @__PURE__ */ React.createElement(
    Topbar,
    {
      page,
      t,
      rail: tw.rail,
      setRail: (v) => setTweak("rail", v),
      now,
      onSearch: () => setCmdk(true),
      theme,
      setTheme: (v) => setTweak("theme", v),
      lang,
      setLang: (v) => setTweak("lang", v),
      onNew: () => setCreateOpen(true),
      toast: pushToast,
      onLogout: handleLogout,
      onToggleMenu: () => setMobileMenuOpen((v) => !v)
    }
  ), /* @__PURE__ */ React.createElement("main", { style: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } }, screens[page]), /* @__PURE__ */ React.createElement(
    MobileBottomNav,
    {
      page,
      setPage: (p) => {
        setPage(p);
        setMobileMenuOpen(false);
      },
      counts,
      onOpenDrawer: () => setMobileMenuOpen(true)
    }
  )), loaded && /* @__PURE__ */ React.createElement(
    OrderDrawer,
    {
      o: loaded,
      t,
      onClose: () => setOpenOrder(null),
      onAdvance: (o) => advance(o),
      onPrint: (o) => {
        setPrintOrder(o);
      },
      onToast: (m) => pushToast(m, "ok", "phone")
    }
  ), printOrder && /* @__PURE__ */ React.createElement(ReceiptModal, { o: printOrder, t, onClose: () => setPrintOrder(null) }), createOpen && /* @__PURE__ */ React.createElement(
    CreateModal,
    {
      t,
      onClose: () => setCreateOpen(false),
      onCreatedOrder: () => {
        syncOrders(false);
        setPage("dispatch");
      },
      onCreatedBooking: () => {
        setPage("bookings");
      },
      toast: pushToast
    }
  ), cmdk && /* @__PURE__ */ React.createElement(CommandPalette, { t, onClose: () => setCmdk(false), go: (p) => {
    setPage(p);
    setCmdk(false);
  } }), /* @__PURE__ */ React.createElement(Toasts, { items: toasts }), /* @__PURE__ */ React.createElement(
    SwitchOperatorModal,
    {
      isOpen: switchUserModalOpen,
      onClose: () => setSwitchUserModalOpen(false),
      currentUser,
      onSelectUser: (u) => {
        setCurrentUser(u);
        try {
          localStorage.setItem("fenix_current_user", JSON.stringify(u));
        } catch (_) {
        }
      },
      toast: pushToast
    }
  ), new URLSearchParams(window.location.search).get("tweaks") === "1" && /* @__PURE__ */ React.createElement(TweaksPanel, { title: "Tweaks" }, /* @__PURE__ */ React.createElement(TweakSection, { label: "\u0422\u0435\u043C\u0430" }, /* @__PURE__ */ React.createElement(
    TweakSelect,
    {
      label: "\u0422\u0435\u043C\u0430 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044F",
      value: theme,
      onChange: (v) => setTweak("theme", v),
      options: THEMES.map((x) => ({ value: x.id, label: x.label }))
    }
  ), /* @__PURE__ */ React.createElement(
    TweakColor,
    {
      label: "\u0410\u043A\u0446\u0435\u043D\u0442",
      value: tw.accentOverride,
      options: (ACCENTS[theme] || ACCENTS.gold).map((a) => a[0] || THEME_FALLBACK[theme]),
      onChange: (v) => setTweak("accentOverride", v === THEME_FALLBACK[theme] ? "" : v)
    }
  )), /* @__PURE__ */ React.createElement(TweakSection, { label: "\u0424\u043E\u0440\u043C\u0430" }, /* @__PURE__ */ React.createElement(
    TweakRadio,
    {
      label: "\u041D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
      value: dir,
      onChange: (v) => setTweak("dir", v),
      options: [["a", "Luxury"], ["b", "\u041C\u0435\u0434\u044C"], ["c", "\u041A\u043E\u043D\u0441\u043E\u043B\u044C"]]
    }
  ), /* @__PURE__ */ React.createElement(
    TweakRadio,
    {
      label: "\u041F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C",
      value: tw.density,
      onChange: (v) => setTweak("density", v),
      options: [["compact", "\u041F\u043B\u043E\u0442\u043D\u043E"], ["balanced", "\u0411\u0430\u043B\u0430\u043D\u0441"], ["airy", "\u0412\u043E\u0437\u0434\u0443\u0445"]]
    }
  ), /* @__PURE__ */ React.createElement(TweakToggle, { label: "\u0421\u0432\u0451\u0440\u043D\u0443\u0442\u0430\u044F \u043F\u0430\u043D\u0435\u043B\u044C", value: tw.rail, onChange: (v) => setTweak("rail", v) })), /* @__PURE__ */ React.createElement(TweakSection, { label: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0438" }, /* @__PURE__ */ React.createElement(
    TweakRadio,
    {
      label: "\u042F\u0437\u044B\u043A",
      value: lang,
      onChange: (v) => setTweak("lang", v),
      options: [["ru", "RU"], ["uz", "UZ"], ["uzc", "\u040E\u0417"]]
    }
  ), /* @__PURE__ */ React.createElement(TweakToggle, { label: "\u0417\u0432\u0443\u043A \u043F\u0440\u0438 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0435", value: tw.sound, onChange: (v) => setTweak("sound", v) }))));
}
const THEME_FALLBACK = { gold: "#d3aa63", graphite: "#78a6dc", oxblood: "#dd9a72", cream: "#9a6f1e" };
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
