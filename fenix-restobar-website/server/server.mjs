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
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "9206368189:AAFIZu2qqtl5JbEEEcXXGbny-8i4zkbu5Hk";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.ADMIN_CHAT_ID || "";
const BOT_USERNAME = process.env.BOT_USERNAME || "Fenix_restaurant_bot";

// Locate fenix_restaurant.db from Telegram Bot project
const DB_CANDIDATES = [
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
        if (r && r.user_id) ids.add(String(r.user_id));
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
  const cleaned = String(phone || "").replace(/[\s\-()]/g, "");
  return /^\+998\d{9}$/.test(cleaned);
}

function formatPrice(num) {
  return Number(num || 0).toLocaleString("ru-RU") + " сум";
}

async function sendTelegramNotification(text) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log("[Telegram skipped — TELEGRAM_BOT_TOKEN not configured]");
    return;
  }

  const recipientIds = getStaffChatIds();
  if (recipientIds.length === 0) {
    console.log("\n[Telegram Alert Preview - No staff registered in DB yet]:");
    console.log(text.replace(/<[^>]*>/g, ""));
    console.log("👉 Tip: Authorize staff by sending '/admin fenix' in @Fenix_restaurant_bot, or set TELEGRAM_CHAT_ID in environment.\n");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  for (const chatId of recipientIds) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML"
        })
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

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Security and CORS headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
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

  // API Submission Endpoints
  if (req.method === "POST" && url.pathname.startsWith("/api/")) {
    const ip = req.socket.remoteAddress || "unknown";
    if (isRateLimited(ip)) {
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

    if (!data.name || !validateUzPhone(data.phone)) {
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

      // Save to SQLite reservations table
      if (db) {
        try {
          db.prepare(`
            INSERT INTO reservations (code, user_id, user_name, customer_name, customer_phone, res_date, res_time, guests, zone, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            code,
            0,
            "Website",
            data.name,
            data.phone,
            data.date || "",
            data.time || "",
            String(data.guests || ""),
            data.hall || "Основной зал",
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
      msg += `▫️ Дата визита: <b>${data.date}</b>\n`;
      msg += `▫️ Время: <b>${data.time || "Не указано"}</b>\n`;
      msg += `▫️ Гостей: <b>${data.guests} чел.</b>\n`;
      if (data.comment) msg += `▫️ Пожелания: <i>${data.comment}</i>\n`;
      msg += `\nСтатус: <b>Ожидает звонка для подтверждения</b>`;

      await sendTelegramNotification(msg);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, id: `WEB-${code}`, code }));
      return;
    }

    if (endpoint === "orders") {
      const orderNum = Math.floor(1000 + Math.random() * 9000);
      let totalPrice = 0;
      const itemsObj = {};
      const itemsLines = [];

      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const qty = Number(item.qty || 1);
          const price = Number(item.price || 0);
          totalPrice += price * qty;
          itemsObj[item.name?.ru || item.name || item.id] = qty;
          itemsLines.push(`▫️ ${item.name?.ru || item.name || item.id} × ${qty} = ${formatPrice(price * qty)}`);
        }
      }

      // Save to SQLite orders table
      if (db) {
        try {
          db.prepare(`
            INSERT INTO orders (order_num, user_id, user_name, customer_name, customer_phone, order_type, address, payment_method, items_json, total_price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            orderNum,
            0,
            "Website",
            data.name,
            data.phone,
            data.mode === "delivery" ? "Доставка курьером (сайт)" : "Самовывоз (сайт)",
            data.address || (data.mode === "delivery" ? "Уточняется" : "Самовывоз"),
            data.payment === "cash" ? "Наличными" : "Онлайн / Карта",
            JSON.stringify(itemsObj),
            totalPrice,
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
      msg += `▫️ Способ: <b>${data.mode === "delivery" ? "🛵 Доставка" : "🛍 Самовывоз"}</b>\n`;
      if (data.mode === "delivery") msg += `▫️ Адрес: <b>${data.address || "Не указан"}</b>\n`;
      msg += `▫️ Оплата: <b>${data.payment === "cash" ? "Наличные" : "Карта / Онлайн"}</b>\n\n`;
      msg += `📋 <b>Состав заказа:</b>\n`;
      msg += itemsLines.join("\n") || "▫️ Позиции уточняются";
      msg += `\n\n💰 <b>ИТОГО К ОПЛАТЕ: ${formatPrice(totalPrice)}</b>`;

      await sendTelegramNotification(msg);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, id: `WEB-${orderNum}`, orderNum, total: totalPrice }));
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
  let reqPath = url.pathname === "/" ? "/index.html" : url.pathname;
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
