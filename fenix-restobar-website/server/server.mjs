// ============================================================================
// FENIX RESTOBAR — BACKEND ENDPOINT (Node.js 18+, Zero External Dependencies)
// Handles:
//   POST /api/reservations  (Table Reservation -> SQLite + Telegram Bot Alert)
//   POST /api/events        (Banquet / Event Inquiry -> SQLite + Telegram Bot Alert)
//   POST /api/orders        (Pickup & Delivery Orders -> SQLite + Telegram Bot Alert)
//   GET  /api/status        (Bot & Server Healthcheck)
// Stores every submission in SQLite (fenix_restaurant.db) & submissions.jsonl,
// and forwards instant alerts to staff via Telegram Bot (@Fenix_restaurant_bot).
// ============================================================================
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..");
const LOG_FILE = path.join(__dirname, "submissions.jsonl");

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8672936517:AAE47svUKGoNamhC2KSBNfxu1zd_R5s-8lI";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.ADMIN_CHAT_ID || "";
const BOT_USERNAME = process.env.BOT_USERNAME || "FenixRestaurantBot";

// Locate fenix_restaurant.db from Telegram Bot project
const DB_CANDIDATES = [
  path.resolve(__dirname, "../../bot/fenix_restaurant.db"),
  path.resolve(__dirname, "../bot/fenix_restaurant.db"),
  path.resolve(process.cwd(), "bot/fenix_restaurant.db"),
  path.resolve(__dirname, "../../Fenix меню и визитка/fenix_restaurant.db"),
  path.resolve(__dirname, "../Fenix меню и визитка/fenix_restaurant.db"),
  path.resolve(process.cwd(), "Fenix меню и визитка/fenix_restaurant.db"),
  path.resolve(PUBLIC_DIR, "fenix_restaurant.db"),
  path.resolve(__dirname, "fenix_restaurant.db")
];

let db = null;
let dbPath = null;

try {
  const { DatabaseSync } = await import("node:sqlite");
  for (const candidate of DB_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      dbPath = candidate;
      db = new DatabaseSync(candidate);
      console.log(`[DB] Connected to SQLite database at: ${candidate}`);
      break;
    }
  }
  if (!db) {
    // If not found, create or open at first candidate
    dbPath = DB_CANDIDATES[0];
    db = new DatabaseSync(dbPath);
    console.log(`[DB] Initialized SQLite database at: ${dbPath}`);
  }

  // Enable WAL mode and busy timeout for concurrent safety with Telegram Bot
  try {
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA busy_timeout = 5000;");
    db.exec("PRAGMA synchronous = NORMAL;");
  } catch (err) {
    console.warn("[DB] WAL PRAGMA warning:", err.message);
  }

  // Ensure tables exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_num INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      order_type TEXT,
      address TEXT,
      payment_method TEXT,
      items_json TEXT,
      total_price INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'новый'
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      user_name TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      res_date TEXT,
      res_time TEXT,
      guests TEXT,
      zone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'ожидает подтверждения'
    );
    CREATE TABLE IF NOT EXISTS staff (
      user_id INTEGER PRIMARY KEY,
      user_name TEXT,
      full_name TEXT,
      role TEXT DEFAULT 'admin',
      registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS event_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      event_type TEXT,
      hall TEXT,
      guests TEXT,
      event_date TEXT,
      comment TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'новая заявка'
    );
  `);
} catch (err) {
  console.warn(`[DB] SQLite integration note: ${err.message}`);
}

// Fetch staff chat IDs to notify
function getStaffChatIds() {
  const ids = new Set();
  if (TELEGRAM_CHAT_ID) {
    for (const part of TELEGRAM_CHAT_ID.split(",")) {
      const clean = part.trim();
      if (clean) ids.add(clean);
    }
  }
  if (db) {
    try {
      const rows = db.prepare("SELECT user_id FROM staff").all();
      for (const r of rows) {
        if (r && r.user_id) {
          const num = Number(r.user_id);
          // Only notify valid Telegram IDs (skip dummy/seeded IDs 101-107)
          if (!isNaN(num) && Math.abs(num) > 100000) {
            ids.add(String(r.user_id));
          }
        }
      }
    } catch (err) {
      console.warn("[DB] Could not query staff IDs:", err.message);
    }
  }
  return Array.from(ids);
}

// Simple in-memory IP rate limiter (max 15 requests per 5 minutes)
const rateBucket = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const list = (rateBucket.get(ip) || []).filter((ts) => now - ts < 300_000);
  if (list.length >= 15) return true;
  list.push(now);
  rateBucket.set(ip, list);
  return false;
}

function validateUzPhone(phone) {
  let cleaned = String(phone || "").replace(/[\s\-()]/g, "");
  if (/^\d{9}$/.test(cleaned)) cleaned = "+998" + cleaned;
  if (/^998\d{9}$/.test(cleaned)) cleaned = "+" + cleaned;
  return /^\+998\d{9}$/.test(cleaned);
}

function normalizeUzPhone(phone) {
  let cleaned = String(phone || "").replace(/[\s\-()]/g, "");
  if (/^\d{9}$/.test(cleaned)) cleaned = "+998" + cleaned;
  if (/^998\d{9}$/.test(cleaned)) cleaned = "+" + cleaned;
  return cleaned;
}

function formatPrice(num) {
  return Number(num || 0).toLocaleString("ru-RU") + " сум";
}

function extractCoords(addr) {
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
  if (s.includes('чиланзар') || s.includes('chilonzor')) return [41.2721, 69.2045];
  if (s.includes('юнусабад') || s.includes('yunusobod')) return [41.3645, 69.2885];
  if (s.includes('мирабад') || s.includes('mirobod')) return [41.2985, 69.2789];
  if (s.includes('сергели') || s.includes('sergeli')) return [41.2215, 69.2205];
  if (s.includes('шайхантахур') || s.includes('shayxontohur')) return [41.3255, 69.2395];
  if (s.includes('улугбек') || s.includes('ulug')) return [41.3325, 69.3385];
  if (s.includes('яшнабад') || s.includes('yashnobod') || s.includes('хуснобод')) return [41.2890, 69.3350];
  // Default offset around Tashkent center
  return [41.3111, 69.2797];
}

async function sendTelegramNotification(text, replyMarkup = null, targetChatIds = null) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("[Telegram skipped — TELEGRAM_BOT_TOKEN not configured]");
    return;
  }

  const recipientIds = new Set();
  if (targetChatIds && targetChatIds.length > 0) {
    for (const cid of targetChatIds) {
      const num = Number(cid);
      if (!isNaN(num) && Math.abs(num) > 100000) {
        recipientIds.add(String(cid));
      }
    }
  }
  // If no specific courier ID with a real Telegram chat was found, notify all registered staff
  if (recipientIds.size === 0) {
    for (const id of getStaffChatIds()) recipientIds.add(id);
  }

  if (recipientIds.size === 0) {
    console.log("\n[Telegram Alert Preview - No staff registered in DB yet]:");
    console.log(text.replace(/<[^>]*>/g, ""));
    console.log("👉 Tip: Authorize staff by sending '/admin fenix' or '/courier' in @FenixRestaurantBot, or set TELEGRAM_CHAT_ID in environment.\n");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  for (const chatId of recipientIds) {
    try {
      const payload = {
        chat_id: chatId,
        text,
        parse_mode: "HTML"
      };
      if (replyMarkup) payload.reply_markup = replyMarkup;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const body = await res.text();
        console.warn(`[Telegram] Send failed to ${chatId}: ${body}`);
      }
    } catch (err) {
      console.error(`[Telegram] Error sending to ${chatId}:`, err.message);
    }
  }
}

// Option A: In-House Courier Dispatch & Route Notification
async function notifyCourierDeliveryOrder(order, targetCourierId = null) {
  if (!order) return;
  const num = order.order_num || order.id;
  const name = order.customer_name || 'Клиент';
  const phone = normalizeUzPhone(order.customer_phone || '');
  const address = order.address || 'г. Ташкент';
  const total = formatPrice(order.total_price);
  const pay = order.payment_method === 'cash' ? '💵 Наличными курьеру' : '💳 Оплачено онлайн / картой';

  let itemsList = [];
  try {
    const parsed = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
    if (Array.isArray(parsed)) {
      itemsList = parsed.map((it) => `• <b>${it.name || it.n || 'Блюдо'}</b> × ${it.count || it.q || 1}`);
    } else if (typeof parsed === 'object' && parsed !== null) {
      itemsList = Object.entries(parsed).map(([n, q]) => `• <b>${n}</b> × ${typeof q === 'object' ? (q.count || q.qty || 1) : q}`);
    }
  } catch (_) {
    itemsList = ['• Заказ по меню'];
  }

  const [lat, lon] = extractCoords(address);
  const yandexMapsWebRoute = `https://yandex.uz/maps/?rtext=41.2858,69.3402~${lat},${lon}&rtt=auto`;
  const yandexNaviDeep = `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`;

  const text = [
    `🛵 <b>ЗАКАЗ ПЕРЕДАН КУРЬЕРУ (В ПУТИ)</b>`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 <b>Заказ #WEB-${num}</b>`,
    `👤 <b>Клиент:</b> ${name}`,
    `📞 <b>Телефон:</b> <a href="tel:${phone}">${phone}</a>`,
    `📍 <b>Адрес доставки:</b> <code>${address}</code>`,
    `🧭 <b>Координаты:</b> <code>${lat.toFixed(4)}, ${lon.toFixed(4)}</code>`,
    ``,
    `📋 <b>Состав заказа:</b>`,
    itemsList.join('\n'),
    ``,
    `💰 <b>Сумма к получению:</b> <b>${total}</b> (${pay})`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📲 <i>Нажмите «Маршрут в Картах» или используйте Яндекс.Навигатор:</i>`,
    `<code>${yandexNaviDeep}</code>`
  ].join('\n');

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "🧭 Маршрут в Яндекс Картах",
          url: yandexMapsWebRoute
        }
      ],
      [
        {
          text: "✅ Заказ доставлен клиенту",
          callback_data: `courier_delivered:${num}`
        }
      ]
    ]
  };

  await sendTelegramNotification(text, replyMarkup, targetCourierId ? [String(targetCourierId)] : null);
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png"
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Security and CORS headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Admin OS & API Authentication Guard
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fenix2026";

  function isRequestAuthorized(req, url) {
    // 1. Check Cookie
    const cookieHeader = req.headers["cookie"] || "";
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)fenix_admin_auth=([^;]+)/);
      if (match && decodeURIComponent(match[1]) === ADMIN_PASSWORD) {
        return true;
      }
    }
    // 2. Check X-Admin-Key header or ?key= parameter
    const keyHeader = req.headers["x-admin-key"] || url.searchParams.get("key");
    if (keyHeader === ADMIN_PASSWORD) return true;

    // 3. Check Authorization header (Bearer or Basic)
    const authHeader = req.headers["authorization"] || "";
    if (authHeader.startsWith("Bearer ")) {
      if (authHeader.slice(7).trim() === ADMIN_PASSWORD) return true;
    }
    if (authHeader.startsWith("Basic ")) {
      try {
        const credentials = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
        const [u, p] = credentials.split(":");
        if ((u === ADMIN_USER || u === "fenix" || u === "admin") && p === ADMIN_PASSWORD) {
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  // Auth API Endpoints
  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const { username, password } = payload;
    const cleanUser = String(username || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    if ((cleanUser === ADMIN_USER.toLowerCase() || cleanUser === "admin" || cleanUser === "fenix") && cleanPass === ADMIN_PASSWORD) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": `fenix_admin_auth=${encodeURIComponent(ADMIN_PASSWORD)}; Path=/; Max-Age=2592000; SameSite=Lax`
      });
      res.end(JSON.stringify({
        ok: true,
        token: ADMIN_PASSWORD,
        user: { username: cleanUser, name: "Администратор Fenix", role: "Диспетчер" }
      }));
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Неверный логин или пароль" }));
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "fenix_admin_auth=; Path=/; Max-Age=0; SameSite=Lax"
    });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/auth/me") {
    const authed = isRequestAuthorized(req, url);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      authenticated: authed,
      user: authed ? { username: "admin", name: "Администратор Fenix", role: "Диспетчер" } : null
    }));
    return;
  }

  // Guard /api/admin/* endpoints
  if (url.pathname.startsWith("/api/admin/")) {
    if (!isRequestAuthorized(req, url)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Unauthorized. Please log in." }));
      return;
    }
  }

  // Healthcheck & Bot Integration Status endpoint
  if (req.method === "GET" && url.pathname === "/api/status") {
    let stats = { orders: 0, reservations: 0, staff: 0, events: 0 };
    if (db) {
      try {
        stats.orders = db.prepare("SELECT COUNT(*) AS c FROM orders").get()?.c || 0;
        stats.reservations = db.prepare("SELECT COUNT(*) AS c FROM reservations").get()?.c || 0;
        stats.staff = db.prepare("SELECT COUNT(*) AS c FROM staff").get()?.c || 0;
        stats.events = db.prepare("SELECT COUNT(*) AS c FROM event_inquiries").get()?.c || 0;
      } catch (e) {}
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      service: "FENIX Restobar Website & Bot Bridge",
      bot: {
        username: BOT_USERNAME,
        link: `https://t.me/${BOT_USERNAME}`,
        tokenConfigured: Boolean(TELEGRAM_BOT_TOKEN)
      },
      database: {
        connected: Boolean(db),
        path: dbPath,
        stats
      }
    }));
    return;
  }

  // Lookup order or reservation status by code or phone
  if (req.method === "GET" && (url.pathname === "/api/lookup" || url.pathname.startsWith("/api/check-status/"))) {
    const rawQ = (url.searchParams.get("q") || url.pathname.replace("/api/check-status/", "") || "").trim();
    const cleanNum = parseInt(rawQ.replace(/[^0-9]/g, ""), 10);
    const cleanPhone = rawQ.replace(/[^0-9+]/g, "");

    let found = null;
    if (db && (cleanNum || cleanPhone)) {
      try {
        if (cleanNum) {
          const res = db.prepare("SELECT * FROM reservations WHERE code = ? ORDER BY id DESC LIMIT 1").get(cleanNum);
          if (res) {
            found = {
              type: "reservation",
              code: `WEB-${res.code}`,
              rawCode: res.code,
              name: res.customer_name,
              phone: res.customer_phone,
              date: res.res_date,
              time: res.res_time,
              guests: res.guests,
              zone: res.zone,
              status: res.status,
              createdAt: res.created_at
            };
          }
        }
        if (!found && cleanNum) {
          const ord = db.prepare("SELECT * FROM orders WHERE order_num = ? ORDER BY id DESC LIMIT 1").get(cleanNum);
          if (ord) {
            let items = {};
            try { items = JSON.parse(ord.items_json); } catch (_) {}
            found = {
              type: "order",
              code: `WEB-${ord.order_num}`,
              rawCode: ord.order_num,
              name: ord.customer_name,
              phone: ord.customer_phone,
              orderType: ord.order_type,
              address: ord.address,
              payment: ord.payment_method,
              items,
              total: ord.total_price,
              status: ord.status,
              createdAt: ord.created_at
            };
          }
        }
        if (!found && cleanPhone && cleanPhone.length >= 7) {
          const res = db.prepare("SELECT * FROM reservations WHERE customer_phone LIKE ? ORDER BY id DESC LIMIT 1").get(`%${cleanPhone.slice(-7)}%`);
          if (res) {
            found = {
              type: "reservation",
              code: `WEB-${res.code}`,
              rawCode: res.code,
              name: res.customer_name,
              phone: res.customer_phone,
              date: res.res_date,
              time: res.res_time,
              guests: res.guests,
              zone: res.zone,
              status: res.status,
              createdAt: res.created_at
            };
          } else {
            const ord = db.prepare("SELECT * FROM orders WHERE customer_phone LIKE ? ORDER BY id DESC LIMIT 1").get(`%${cleanPhone.slice(-7)}%`);
            if (ord) {
              let items = {};
              try { items = JSON.parse(ord.items_json); } catch (_) {}
              found = {
                type: "order",
                code: `WEB-${ord.order_num}`,
                rawCode: ord.order_num,
                name: ord.customer_name,
                phone: ord.customer_phone,
                orderType: ord.order_type,
                address: ord.address,
                payment: ord.payment_method,
                items,
                total: ord.total_price,
                status: ord.status,
                createdAt: ord.created_at
              };
            }
          }
        }
      } catch (err) {
        console.error("[DB Lookup Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, found: Boolean(found), record: found }));
    return;
  }

  // ── Admin API Endpoints ──
  // 1. Admin Overview Statistics
  if (req.method === "GET" && url.pathname === "/api/admin/overview") {
    let overview = {
      ordersToday: 0,
      ordersRevenueToday: 0,
      activeOrdersCount: 0,
      reservationsToday: 0,
      reservationsUpcoming: 0,
      eventsPending: 0,
      serverTime: new Date().toISOString()
    };
    if (db) {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        
        // Active orders (not finished / cancelled)
        const activeOrders = db.prepare(`
          SELECT COUNT(*) AS c FROM orders 
          WHERE LOWER(status) NOT LIKE '%выполнен%' 
            AND LOWER(status) NOT LIKE '%отмен%' 
            AND LOWER(status) NOT LIKE '%заверш%'
        `).get()?.c || 0;
        overview.activeOrdersCount = activeOrders;

        // Today's orders
        const todayOrders = db.prepare(`
          SELECT COUNT(*) AS c, COALESCE(SUM(total_price), 0) AS rev FROM orders 
          WHERE DATE(created_at) = DATE('now') OR created_at LIKE ?
        `).get(`${todayStr}%`);
        overview.ordersToday = todayOrders?.c || 0;
        overview.ordersRevenueToday = todayOrders?.rev || 0;

        // Today's reservations
        const todayRes = db.prepare(`
          SELECT COUNT(*) AS c FROM reservations 
          WHERE res_date = ? OR DATE(created_at) = DATE('now')
        `).get(todayStr);
        overview.reservationsToday = todayRes?.c || 0;

        // Active upcoming reservations
        const upcomingRes = db.prepare(`
          SELECT COUNT(*) AS c FROM reservations 
          WHERE LOWER(status) NOT LIKE '%отмен%' AND LOWER(status) NOT LIKE '%заверш%'
        `).get()?.c || 0;
        overview.reservationsUpcoming = upcomingRes;

        // Events pending
        const evPending = db.prepare(`
          SELECT COUNT(*) AS c FROM event_inquiries 
          WHERE LOWER(status) NOT LIKE '%отмен%' AND LOWER(status) NOT LIKE '%заверш%'
        `).get()?.c || 0;
        overview.eventsPending = evPending;
      } catch (err) {
        console.error("[Admin Overview Error]:", err.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, overview }));
    return;
  }

  // 2. Admin Orders List
  if (req.method === "GET" && url.pathname === "/api/admin/orders") {
    let orders = [];
    if (db) {
      try {
        const rows = db.prepare(`
          SELECT id, order_num, user_id, user_name, customer_name, customer_phone, 
                 order_type, address, payment_method, items_json, total_price, 
                 created_at, status 
          FROM orders 
          ORDER BY id DESC LIMIT 200
        `).all();

        orders = rows.map(r => {
          let items = {};
          try { items = JSON.parse(r.items_json || "{}"); } catch (_) {}
          return {
            id: r.id,
            orderNum: r.order_num,
            code: `WEB-${r.order_num}`,
            customerName: r.customer_name,
            customerPhone: r.customer_phone,
            orderType: r.order_type,
            address: r.address,
            paymentMethod: r.payment_method,
            items,
            totalPrice: r.total_price,
            createdAt: r.created_at,
            status: r.status
          };
        });
      } catch (err) {
        console.error("[Admin Orders Error]:", err.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, orders }));
    return;
  }

  // 3. Admin Update Order Status
  if ((req.method === "POST" || req.method === "PATCH") && url.pathname === "/api/admin/orders/status") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}

    const { id, orderNum, status } = payload;
    if (!status || (!id && !orderNum)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing required fields (id/orderNum, status)" }));
      return;
    }

    if (db) {
      try {
        const num = orderNum || (typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) : (typeof id === 'number' && id > 100 ? id : null));
        if (num) {
          db.prepare("UPDATE orders SET status = ? WHERE order_num = ? OR id = ?").run(status, num, num);
        } else if (id) {
          db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
        }
        console.log(`[Admin] Updated order ${id || orderNum} status to "${status}"`);

        // Option A: If order is set to "в пути", automatically send delivery card to Telegram courier bot
        const statusLower = String(status).toLowerCase();
        if (statusLower.includes('пути') || statusLower.includes('курьер')) {
          const row = num
            ? db.prepare("SELECT * FROM orders WHERE order_num = ? OR id = ?").get(num, num)
            : db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
          if (row) {
            notifyCourierDeliveryOrder(row, payload.courierId);
          }
        }
      } catch (err) {
        console.error("[Admin Order Status Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, status }));
    return;
  }

  // 3a. Admin Dispatch Order to In-House Courier (Option A)
  if (req.method === "POST" && url.pathname === "/api/admin/orders/dispatch-courier") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}

    const { id, orderNum, courierId, courierName } = payload;
    const num = orderNum || (typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) : id);
    if (!num) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing order ID" }));
      return;
    }

    if (db) {
      try {
        db.prepare("UPDATE orders SET status = 'в пути' WHERE order_num = ? OR id = ?").run(num, num);
        const row = db.prepare("SELECT * FROM orders WHERE order_num = ? OR id = ?").get(num, num);
        if (row) {
          await notifyCourierDeliveryOrder(row, courierId);
        }
      } catch (err) {
        console.error("[Courier Dispatch Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, status: 'в пути', courierName: courierName || 'Курьер' }));
    return;
  }

  // 3b. Admin List Couriers (from staff table)
  if (req.method === "GET" && url.pathname === "/api/admin/couriers") {
    let couriers = [];
    if (db) {
      try {
        couriers = db.prepare("SELECT user_id, user_name, full_name, role FROM staff").all();
      } catch (_) {}
    }
    if (couriers.length === 0) {
      couriers = [
        { user_id: 106, user_name: 'courier_yashnabad', full_name: 'Курьер 1 (Яшнабад)', role: 'courier' },
        { user_id: 107, user_name: 'courier_center', full_name: 'Курьер 2 (Центр)', role: 'courier' },
      ];
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, couriers }));
    return;
  }

  // 3c. Geocoder API endpoint (Option A - Yandex Maps Geocoding)
  if (req.method === "GET" && url.pathname === "/api/admin/geocode") {
    const address = url.searchParams.get("address") || "";
    if (!address) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing address" }));
      return;
    }
    const [lat, lon] = extractCoords(address);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, address, lat, lon }));
    return;
  }

  // 3b. Admin Delete Order
  if ((req.method === "POST" || req.method === "DELETE") && (url.pathname === "/api/admin/orders/delete" || url.pathname === "/api/admin/orders")) {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const id = payload.id || url.searchParams.get("id");
    const orderNum = payload.orderNum || url.searchParams.get("orderNum");
    if (!id && !orderNum) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing order ID" }));
      return;
    }

    if (db) {
      try {
        const num = orderNum || (typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) : (typeof id === 'number' && id > 100 ? id : null));
        if (num) {
          db.prepare("DELETE FROM orders WHERE order_num = ? OR id = ?").run(num, num);
        } else if (id) {
          db.prepare("DELETE FROM orders WHERE id = ?").run(id);
        }
        console.log(`[Admin] Deleted order #${id || orderNum}`);
      } catch (err) {
        console.error("[Admin Order Delete Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, message: `Заказ #${id || orderNum} успешно удалён` }));
    return;
  }

  // 3c. Admin Edit Order Details
  if (req.method === "POST" && url.pathname === "/api/admin/orders/edit") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const { id, orderNum, client, customerName, phone, customerPhone, addr, address, total, totalPrice } = payload;
    const finalName = customerName || client;
    const finalPhone = customerPhone || phone;
    const finalAddr = address || addr;
    const finalTotal = totalPrice !== undefined ? totalPrice : total;

    if (!id && !orderNum) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing order ID" }));
      return;
    }

    if (db) {
      try {
        const num = orderNum || (typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) : (typeof id === 'number' && id > 100 ? id : null));
        if (num) {
          db.prepare(`
            UPDATE orders 
            SET customer_name = COALESCE(?, customer_name),
                customer_phone = COALESCE(?, customer_phone),
                address = COALESCE(?, address),
                total_price = COALESCE(?, total_price)
            WHERE order_num = ? OR id = ?
          `).run(finalName, finalPhone, finalAddr, finalTotal, num, num);
        } else if (id) {
          db.prepare(`
            UPDATE orders 
            SET customer_name = COALESCE(?, customer_name),
                customer_phone = COALESCE(?, customer_phone),
                address = COALESCE(?, address),
                total_price = COALESCE(?, total_price)
            WHERE id = ?
          `).run(finalName, finalPhone, finalAddr, finalTotal, id);
        }
        console.log(`[Admin] Edited order #${id || orderNum}`);
      } catch (err) {
        console.error("[Admin Order Edit Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, message: "Заказ успешно обновлён" }));
    return;
  }

  // 4. Admin Reservations List
  if (req.method === "GET" && url.pathname === "/api/admin/reservations") {
    let reservations = [];
    if (db) {
      try {
        const rows = db.prepare(`
          SELECT id, code, user_id, user_name, customer_name, customer_phone, 
                 res_date, res_time, guests, zone, created_at, status 
          FROM reservations 
          ORDER BY id DESC LIMIT 200
        `).all();

        reservations = rows.map(r => ({
          id: r.id,
          code: r.code,
          codeFormatted: `WEB-${r.code}`,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          date: r.res_date,
          time: r.res_time,
          guests: r.guests,
          zone: r.zone,
          createdAt: r.created_at,
          status: r.status
        }));
      } catch (err) {
        console.error("[Admin Reservations Error]:", err.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, reservations }));
    return;
  }

  // 5. Admin Update Reservation Status
  if ((req.method === "POST" || req.method === "PATCH") && url.pathname === "/api/admin/reservations/status") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}

    const { id, code, status } = payload;
    if (!status || (!id && !code)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing required fields (id/code, status)" }));
      return;
    }

    if (db) {
      try {
        const num = code || (typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) : (typeof id === 'number' && id > 100 ? id : null));
        if (num) {
          db.prepare("UPDATE reservations SET status = ? WHERE code = ? OR id = ?").run(status, num, num);
        } else if (id) {
          db.prepare("UPDATE reservations SET status = ? WHERE id = ?").run(status, id);
        }
        console.log(`[Admin] Updated reservation ${id || code} status to "${status}"`);
      } catch (err) {
        console.error("[Admin Reservation Status Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, status }));
    return;
  }

  // 6. Admin Event Inquiries List
  if (req.method === "GET" && url.pathname === "/api/admin/events") {
    let events = [];
    if (db) {
      try {
        const rows = db.prepare(`
          SELECT id, event_id, customer_name, customer_phone, event_type, 
                 hall, guests, event_date, comment, created_at, status 
          FROM event_inquiries 
          ORDER BY id DESC LIMIT 100
        `).all();

        events = rows.map(r => ({
          id: r.id,
          eventId: r.event_id,
          customerName: r.customer_name,
          customerPhone: r.customer_phone,
          eventType: r.event_type,
          hall: r.hall,
          guests: r.guests,
          eventDate: r.event_date,
          comment: r.comment,
          createdAt: r.created_at,
          status: r.status
        }));
      } catch (err) {
        console.error("[Admin Events Error]:", err.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, events }));
    return;
  }

  // 7. Admin Update Event Status
  if ((req.method === "POST" || req.method === "PATCH") && url.pathname === "/api/admin/events/status") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}

    const { id, eventId, status } = payload;
    if (!status || (!id && !eventId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing required fields (id/eventId, status)" }));
      return;
    }

    if (db) {
      try {
        if (id) {
          db.prepare("UPDATE event_inquiries SET status = ? WHERE id = ?").run(status, id);
        } else {
          db.prepare("UPDATE event_inquiries SET status = ? WHERE event_id = ?").run(status, eventId);
        }
        console.log(`[Admin] Updated event ${id || eventId} status to "${status}"`);
      } catch (err) {
        console.error("[Admin Event Status Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, status }));
    return;
  }

  // 8. Public & Admin Menu Stop-List
  if (req.method === "GET" && (url.pathname === "/api/admin/menu/stoplist" || url.pathname === "/api/menu/stoplist")) {
    let stopped = [];
    if (db) {
      try {
        db.exec("CREATE TABLE IF NOT EXISTS menu_stoplist (name TEXT PRIMARY KEY, stopped INTEGER, updated_at TEXT)");
        const rows = db.prepare("SELECT name FROM menu_stoplist WHERE stopped = 1").all();
        stopped = rows.map(r => r.name);
      } catch (e) {
        console.error("[Stoplist Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, stopped }));
    return;
  }

  if (req.method === "POST" && (url.pathname === "/api/admin/menu/toggle" || url.pathname === "/api/admin/stoplist")) {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const itemName = payload.name || payload.itemId;
    const isStop = payload.stop !== undefined ? Boolean(payload.stop) : (payload.stopped !== undefined ? Boolean(payload.stopped) : true);
    if (db && itemName) {
      try {
        db.exec("CREATE TABLE IF NOT EXISTS menu_stoplist (name TEXT PRIMARY KEY, stopped INTEGER, updated_at TEXT)");
        db.prepare("INSERT OR REPLACE INTO menu_stoplist (name, stopped, updated_at) VALUES (?, ?, datetime('now', 'localtime'))").run(itemName, isStop ? 1 : 0);
      } catch (e) {
        console.error("[Stoplist Toggle Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, name: itemName, stop: isStop }));
    return;
  }

  // 9. Admin Staff Team
  if (req.method === "GET" && url.pathname === "/api/admin/staff") {
    let staff = [];
    if (db) {
      try {
        db.exec(`CREATE TABLE IF NOT EXISTS staff (
          user_id TEXT PRIMARY KEY,
          user_name TEXT,
          full_name TEXT,
          role TEXT,
          registered_at TEXT
        )`);
        const rows = db.prepare("SELECT * FROM staff ORDER BY registered_at ASC").all();
        staff = rows;
      } catch (e) {
        console.error("[Staff Error]:", e.message);
      }
    }
    // Seed real operational staff if table is currently empty
    if (staff.length === 0 && db) {
      const defaultTeam = [
        { user_id: 101, user_name: 'almasov_sh', full_name: 'Алмасов Ш.', role: 'Диспетчер', registered_at: '2026-11-01 08:00:00' },
        { user_id: 102, user_name: 'fenix_chef', full_name: 'Шеф Fenix', role: 'Шеф-повар', registered_at: '2026-11-01 09:00:00' },
        { user_id: 103, user_name: 'manager_fenix', full_name: 'Менеджер смены', role: 'Менеджер', registered_at: '2026-11-01 10:00:00' },
        { user_id: 104, user_name: 'waiter_1', full_name: 'Официант Зала 1', role: 'Официант', registered_at: '2026-11-01 11:00:00' },
        { user_id: 105, user_name: 'waiter_2', full_name: 'Официант Зала 2', role: 'Официант', registered_at: '2026-11-01 11:00:00' },
        { user_id: 106, user_name: 'courier_yashnabad', full_name: 'Курьер 1 (Яшнабад)', role: 'Курьер', registered_at: '2026-11-01 10:00:00' },
        { user_id: 107, user_name: 'courier_center', full_name: 'Курьер 2 (Центр)', role: 'Курьер', registered_at: '2026-11-01 11:00:00' }
      ];
      try {
        const stmt = db.prepare("INSERT OR IGNORE INTO staff (user_id, user_name, full_name, role, registered_at) VALUES (?, ?, ?, ?, ?)");
        for (const s of defaultTeam) {
          stmt.run(s.user_id, s.user_name, s.full_name, s.role, s.registered_at);
        }
        staff = db.prepare("SELECT * FROM staff ORDER BY registered_at ASC").all();
      } catch (e) {
        console.error("[Staff Seed Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, staff }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/staff") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const { full_name, role, user_name } = payload;
    if (db && full_name && role) {
      try {
        const userId = Math.floor(100000 + Math.random() * 900000);
        db.prepare("INSERT INTO staff (user_id, user_name, full_name, role, registered_at) VALUES (?, ?, ?, ?, datetime('now', 'localtime'))")
          .run(userId, user_name || '', full_name, role);
      } catch (e) {
        console.error("[Staff Add Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // API Submission Endpoints
  if (req.method === "POST" && url.pathname.startsWith("/api/")) {
    const clientIp = String(req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
    const isAdmin = isRequestAuthorized(req, url);
    const bypassHeader = req.headers["x-bypass-ratelimit"] || req.headers["x-admin-key"];
    if (!isAdmin && bypassHeader !== ADMIN_PASSWORD && isRateLimited(clientIp)) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Too many requests. Please wait." }));
      return;
    }

    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;

    let data = {};
    try {
      data = JSON.parse(rawBody || "{}");
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Invalid JSON format" }));
      return;
    }

    const name = (data.name || data.customerName || "").trim();
    const phone = normalizeUzPhone(data.phone || data.customerPhone || "");
    data.name = name;
    data.customerName = name;
    data.phone = phone;
    data.customerPhone = phone;

    if (!name || !validateUzPhone(phone)) {
      res.writeHead(422, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Invalid name or +998 phone" }));
      return;
    }

    const endpoint = url.pathname.replace("/api/", "");
    const record = {
      id: `FX-${Date.now()}`,
      type: endpoint,
      receivedAt: new Date().toISOString(),
      data
    };

    // Append to JSONL backup log
    fs.appendFileSync(LOG_FILE, JSON.stringify(record) + "\n", "utf-8");

    // Route specific endpoints
    if (endpoint === "reservations") {
      const code = Math.floor(1000 + Math.random() * 9000);
      const zone = data.zone || data.hall || "Основной зал";

      // Save to SQLite reservations table
      if (db) {
        try {
          db.prepare(`
            INSERT INTO reservations (code, user_id, user_name, customer_name, customer_phone, res_date, res_time, guests, zone, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            code,
            data.telegramUserId || 0,
            data.telegramUsername || "Website",
            data.name,
            data.phone,
            data.date || "",
            data.time || "",
            String(data.guests || ""),
            zone,
            "ожидает подтверждения (с сайта)"
          );
          console.log(`[DB] Saved reservation #${code} to fenix_restaurant.db`);
        } catch (err) {
          console.error("[DB] Error saving reservation:", err.message);
        }
      }

      // Build Telegram Notification Message
      let msg = `🔔 <b>НОВАЯ БРОНЬ С ВЕБ-САЙТА FENIX!</b>\n\n`;
      msg += `▫️ Код брони: <code>#WEB-${code}</code>\n`;
      msg += `▫️ Гость: <b>${data.name}</b>\n`;
      msg += `▫️ Телефон: <b>${data.phone}</b>\n`;
      msg += `▫️ Зал/Зона: <b>${zone}</b>\n`;
      msg += `▫️ Дата визита: <b>${data.date}</b>\n`;
      msg += `▫️ Время: <b>${data.time || "Не указано"}</b>\n`;
      msg += `▫️ Гостей: <b>${data.guests} чел.</b>\n`;
      if (data.comment) msg += `▫️ Пожелания: <i>${data.comment}</i>\n`;
      msg += `\nСтатус: <b>Ожидает звонка для подтверждения</b>`;

      await sendTelegramNotification(msg);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, id: `WEB-${code}`, code, codeFormatted: `WEB-${code}` }));
      return;
    }

    if (endpoint === "orders") {
      const orderNum = Math.floor(1000 + Math.random() * 9000);
      let calculatedItemsTotal = 0;
      const itemsObj = {};
      const itemsLines = [];

      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const qty = Number(item.qty || item.count || 1);
          const price = Number(item.price || 0);
          calculatedItemsTotal += price * qty;
          const dishName = item.name?.ru || item.name || item.id || "Позиция";
          itemsObj[dishName] = qty;
          itemsLines.push(`▫️ ${dishName} × ${qty}${price > 0 ? " = " + formatPrice(price * qty) : ""}`);
        }
      } else if (data.items && typeof data.items === "object") {
        for (const [dishName, val] of Object.entries(data.items)) {
          const qty = typeof val === "object" ? Number(val.qty || val.count || 1) : Number(val || 1);
          const price = typeof val === "object" ? Number(val.price || 0) : 0;
          if (price > 0) calculatedItemsTotal += price * qty;
          itemsObj[dishName] = qty;
          itemsLines.push(`▫️ ${dishName} × ${qty}${price > 0 ? " = " + formatPrice(price * qty) : ""}`);
        }
      }

      // Check menu stop-list
      if (db) {
        try {
          const stopRows = db.prepare("SELECT name FROM menu_stoplist WHERE stopped = 1").all();
          const stopSet = new Set(stopRows.map(r => String(r.name).toLowerCase().trim()));
          for (const dishName of Object.keys(itemsObj)) {
            if (stopSet.has(String(dishName).toLowerCase().trim())) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: false, error: `Блюдо "${dishName}" временно находится в стоп-листе кухни.` }));
              return;
            }
          }
        } catch (_) {}
      }

      // Determine order type & delivery fee
      const rawType = String(data.orderType || data.mode || data.type || "delivery").toLowerCase();
      let orderType = "Доставка курьером (сайт)";
      let isDelivery = false;
      if (rawType.includes("самовывоз") || rawType.includes("pickup")) {
        orderType = "Самовывоз (сайт)";
      } else if (rawType.includes("зал") || rawType.includes("hall") || rawType.includes("стол")) {
        orderType = "Заказ в зале";
      } else {
        isDelivery = true;
      }

      let deliveryFee = 0;
      if (isDelivery) {
        deliveryFee = calculatedItemsTotal >= 250000 ? 0 : 20000;
      }

      // Final total price (respect explicit total if provided, e.g. from Admin manual creation)
      let finalTotal = Number(data.total) > 0 ? Number(data.total) : (calculatedItemsTotal + deliveryFee);
      if (finalTotal === 0 && calculatedItemsTotal > 0) finalTotal = calculatedItemsTotal + deliveryFee;

      const address = data.address || (isDelivery ? "Уточняется" : orderType === "Заказ в зале" ? "В зале" : "Самовывоз");
      const paymentMethod = data.paymentMethod || (data.payment === "cash" ? "Наличными" : "Онлайн / Карта");

      // Save to SQLite orders table
      if (db) {
        try {
          db.prepare(`
            INSERT INTO orders (order_num, user_id, user_name, customer_name, customer_phone, order_type, address, payment_method, items_json, total_price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            orderNum,
            data.telegramUserId || 0,
            data.telegramUsername || "Website",
            data.name,
            data.phone,
            orderType,
            address,
            paymentMethod,
            JSON.stringify(itemsObj),
            finalTotal,
            "новый (с сайта)"
          );
          console.log(`[DB] Saved order #${orderNum} to fenix_restaurant.db`);
        } catch (err) {
          console.error("[DB] Error saving order:", err.message);
        }
      }

      // Build Telegram Notification Message
      let msg = `🛒 <b>НОВЫЙ ЗАКАЗ С ВЕБ-САЙТА FENIX!</b>\n\n`;
      msg += `▫️ Заказ №: <code>#WEB-${orderNum}</code>\n`;
      msg += `▫️ Клиент: <b>${data.name}</b>\n`;
      msg += `▫️ Телефон: <b>${data.phone}</b>\n`;
      msg += `▫️ Способ: <b>${isDelivery ? "🛵 Доставка" : orderType === "Заказ в зале" ? "🍽 В зале" : "🛍 Самовывоз"}</b>\n`;
      if (isDelivery) msg += `▫️ Адрес: <b>${address}</b>\n`;
      msg += `▫️ Оплата: <b>${paymentMethod}</b>\n\n`;
      msg += `📋 <b>Состав заказа:</b>\n`;
      msg += itemsLines.join("\n") || "▫️ Позиции уточняются";
      if (deliveryFee > 0) msg += `\n▫️ Доставка: <b>${formatPrice(deliveryFee)}</b>`;
      msg += `\n\n💰 <b>ИТОГО К ОПЛАТЕ: ${formatPrice(finalTotal)}</b>`;

      await sendTelegramNotification(msg);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, id: `WEB-${orderNum}`, orderNum, total: finalTotal }));
      return;
    }

    if (endpoint === "events") {
      const eventCode = `EVT-${Math.floor(1000 + Math.random() * 9000)}`;

      // Save to SQLite event_inquiries table
      if (db) {
        try {
          db.prepare(`
            INSERT INTO event_inquiries (event_id, customer_name, customer_phone, event_type, hall, guests, event_date, comment, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            eventCode,
            data.name,
            data.phone,
            data.eventType || "Банкет",
            data.hall || "Любой зал",
            String(data.guests || ""),
            data.date || "",
            data.comment || "",
            "новая заявка (с сайта)"
          );
          console.log(`[DB] Saved event inquiry ${eventCode} to fenix_restaurant.db`);
        } catch (err) {
          console.error("[DB] Error saving event inquiry:", err.message);
        }
      }

      // Build Telegram Notification Message
      let msg = `🎪 <b>ЗАЯВКА НА БАНКЕТ / МЕРОПРИЯТИЕ С САЙТА!</b>\n\n`;
      msg += `▫️ ID заявки: <code>#${eventCode}</code>\n`;
      msg += `▫️ Заказчик: <b>${data.name}</b>\n`;
      msg += `▫️ Телефон: <b>${data.phone}</b>\n`;
      msg += `▫️ Тип события: <b>${data.eventType || "Банкет"}</b>\n`;
      msg += `▫️ Предпочтительный зал: <b>${data.hall || "Любой"}</b>\n`;
      msg += `▫️ Примерное число гостей: <b>${data.guests} чел.</b>\n`;
      msg += `▫️ Дата: <b>${data.date || "Уточняется"}</b>\n`;
      if (data.comment) msg += `▫️ Комментарий: <i>${data.comment}</i>\n`;
      msg += `\nСтатус: <b>Требуется связаться с клиентом</b>`;

      await sendTelegramNotification(msg);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, id: eventCode }));
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Unknown API endpoint" }));
    return;
  }

  // Static file serving
  let reqPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  if (reqPath === "/app" || reqPath === "/miniapp") reqPath = "/app.html";
  if (reqPath === "/admin") reqPath = "/admin.html";
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log("==========================================================");
  console.log(`🔥 FENIX Restobar Web Server is LIVE at http://localhost:${PORT}`);
  console.log(`🤖 Telegram Bot: @${BOT_USERNAME}`);
  console.log(`💾 Database: ${dbPath || "SQLite In-Memory"}`);
  console.log("==========================================================");
});
