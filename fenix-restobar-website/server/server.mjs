// ============================================================================
// FENIX RESTOBAR — BACKEND ENDPOINT (Node.js 22.5+, Zero External Dependencies)
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
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..");
const LOG_FILE = path.join(__dirname, "submissions.jsonl");

// Lightweight .env file loader
function loadEnv() {
  const envPaths = [
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, ".env"),
    path.resolve(process.cwd(), ".env")
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      try {
        const lines = fs.readFileSync(p, "utf-8").split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const idx = trimmed.indexOf("=");
          if (idx > 0) {
            const k = trimmed.slice(0, idx).trim();
            let v = trimmed.slice(idx + 1).trim();
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1);
            }
            if (!process.env[k]) {
              process.env[k] = v;
            }
          }
        }
      } catch (_) {}
    }
  }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.ADMIN_CHAT_ID || "";
const BOT_USERNAME = process.env.BOT_USERNAME || "FenixRestaurantBot";

// Dedicated Courier Bot (Option 2 + Option 3 Logistics Bot)
const COURIER_BOT_TOKEN = process.env.COURIER_BOT_TOKEN || "";
const COURIER_BOT_USERNAME = process.env.COURIER_BOT_USERNAME || "FenixRestaurantCourierBot";

// Telegram WebApp initData HMAC-SHA256 signature verification
function verifyTelegramInitData(initDataRaw, botToken) {
  if (!initDataRaw || !botToken) return null;
  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get("hash");
    if (!hash) return null;

    params.delete("hash");

    const items = [];
    for (const [key, val] of params.entries()) {
      items.push(`${key}=${val}`);
    }
    items.sort();
    const dataCheckString = items.join("\n");

    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (hash.length !== expectedHash.length) return null;
    const isValid = crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
    if (!isValid) return null;

    const authDate = parseInt(params.get("auth_date") || "0", 10);
    const nowSec = Math.floor(Date.now() / 1000);
    // Auth date must be within 24 hours (86400s) and not in the far future
    if (nowSec - authDate > 86400 || authDate > nowSec + 300) {
      return null;
    }

    const userRaw = params.get("user");
    if (!userRaw) return null;
    return JSON.parse(userRaw);
  } catch (_) {
    return null;
  }
}

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
  let DatabaseSync;
  try {
    const sqliteModule = await import("node:sqlite");
    DatabaseSync = sqliteModule.DatabaseSync;
  } catch (err) {
    console.error("FATAL: Failed to import 'node:sqlite'. Node.js 22.5+ is required to run the FENIX backend.");
    console.error("Current Node.js version:", process.version);
    throw err;
  }

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
      table_assigned TEXT,
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
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      cuisine TEXT,
      category TEXT,
      name TEXT,
      name_uz TEXT,
      name_en TEXT,
      price INTEGER,
      price_alt INTEGER,
      size TEXT,
      note TEXT,
      image TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS customers (
      user_id INTEGER PRIMARY KEY,
      full_name TEXT,
      phone TEXT,
      default_address TEXT,
      language TEXT DEFAULT 'ru',
      bonus_points INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  try { db.exec("ALTER TABLE orders ADD COLUMN courier_name TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE orders ADD COLUMN courier_id TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE reservations ADD COLUMN table_assigned TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE staff ADD COLUMN phone TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE staff ADD COLUMN shift TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE staff ADD COLUMN status TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE staff ADD COLUMN telegram_id TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE staff ADD COLUMN vehicle TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE customers ADD COLUMN default_address TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE customers ADD COLUMN language TEXT DEFAULT 'ru';"); } catch (_) {}
  try { db.exec("ALTER TABLE customers ADD COLUMN bonus_points INTEGER DEFAULT 0;"); } catch (_) {}
  try { db.exec("ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"); } catch (_) {}

  // Auto-seed menu_items from menu-data.js if table is empty
  try {
    const menuCount = db.prepare("SELECT COUNT(*) AS c FROM menu_items").get()?.c || 0;
    if (menuCount === 0) {
      const menuFile = path.join(PUBLIC_DIR, "data/menu-data.js");
      if (fs.existsSync(menuFile)) {
        const raw = fs.readFileSync(menuFile, "utf-8");
        const match = raw.match(/window\.FENIX_MENU\s*=\s*(\{[\s\S]*\});?\s*$/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          const insertStmt = db.prepare(`
            INSERT OR IGNORE INTO menu_items (id, cuisine, category, name, name_uz, name_en, price, price_alt, size, note, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
          `);
          for (const it of (parsed.items || [])) {
            insertStmt.run(it[0], it[1], it[2], it[3], it[4] || "", it[5] || "", it[6] || 0, it[7] || null, it[8] || null, it[9] || null);
          }
          console.log(`[DB] Auto-seeded ${(parsed.items || []).length} dishes into menu_items table.`);
        }
      }
    } else {
      syncMenuFiles(db);
    }
  } catch (seedErr) {
    console.error("[DB Seed Error]:", seedErr.message);
  }
} catch (err) {
  console.warn(`[DB] SQLite integration note: ${err.message}`);
}

// Fetch staff / manager chat IDs to notify for reservations, banquets, and pickup orders
function getStaffChatIds() {
  const ids = new Set();
  const envAdmin = process.env.TELEGRAM_CHAT_ID || process.env.ADMIN_CHAT_ID;
  if (envAdmin) {
    for (const part of String(envAdmin).split(",")) {
      const clean = part.trim();
      const num = Number(clean);
      if (!isNaN(num) && Math.abs(num) > 100000) ids.add(clean);
    }
  }
  if (db) {
    try {
      const rows = db.prepare("SELECT user_id, telegram_id, role FROM staff").all();
      for (const r of rows) {
        const role = String(r.role || '').toLowerCase();
        if (role.includes('admin') || role.includes('manager') || role.includes('менеджер') || role.includes('админ') || role.includes('диспетчер') || role.includes('хостес')) {
          const tid = r.telegram_id || r.user_id;
          const num = Number(tid);
          if (!isNaN(num) && Math.abs(num) > 100000) ids.add(String(tid));
        }
      }
    } catch (_) {}
  }
  return Array.from(ids);
}

// Fetch configured Courier Group chat ID (Option 3)
function getCourierGroupId() {
  if (db) {
    try {
      const row = db.prepare("SELECT value FROM app_settings WHERE key = 'courier_group_id'").get();
      if (row && row.value) return String(row.value).trim();
    } catch (_) {}
  }
  return process.env.COURIER_GROUP_CHAT_ID ? String(process.env.COURIER_GROUP_CHAT_ID).trim() : null;
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

// In-memory geocoding caches (Tashkent delivery)
const reverseGeoCache = new Map();
const searchGeoCache = new Map();

function syncMenuFiles(dbInstance) {
  if (!dbInstance) return;
  try {
    const filePath = path.join(PUBLIC_DIR, "data/menu-data.js");
    let sections = {
      europe: [
        { id: "starters", ru: "Закуски", uz: "Salqin taomlar", en: "Starters" },
        { id: "salads", ru: "Салаты", uz: "Salatlar", en: "Salads" },
        { id: "soups", ru: "Первые блюда", uz: "Birinchi taomlar", en: "Soups" },
        { id: "mains", ru: "Вторые блюда", uz: "Asosiy taomlar", en: "Main courses" },
        { id: "kebabs", ru: "Шашлыки кавказские", uz: "Kavkaz shashliklari", en: "Caucasian kebabs" },
        { id: "mini-kebabs", ru: "Маленькие шашлыки", uz: "Kichik shashliklar", en: "Small kebabs" },
        { id: "fish", ru: "Рыбные", uz: "Baliq", en: "Grilled fish" },
        { id: "grilled-veg", ru: "Овощные", uz: "Sabzavotlar", en: "Grilled vegetables" },
        { id: "sides", ru: "Гарниры", uz: "Garnirlar", en: "Sides" },
        { id: "bread", ru: "Хлеба", uz: "Nonlar", en: "Bread" },
        { id: "soft", ru: "Напитки", uz: "Ichimliklar", en: "Soft drinks" }
      ],
      korea: [
        { id: "starters", ru: "Закуски", uz: "Salqin taomlar", en: "Starters" },
        { id: "salads", ru: "Салаты", uz: "Salatlar", en: "Salads" },
        { id: "soups", ru: "Первые блюда", uz: "Birinchi taomlar", en: "Soups" },
        { id: "mains", ru: "Вторые блюда", uz: "Asosiy taomlar", en: "Main courses" },
        { id: "flour", ru: "Мучные изделия", uz: "Un mahsulotlari", en: "Flour dishes" },
        { id: "tea", ru: "Чай", uz: "Choy", en: "Tea" }
      ],
      bar: [
        { id: "cocktails", ru: "Коктейли", uz: "Kokteyllar", en: "Cocktails" },
        { id: "lemonades", ru: "Лимонады", uz: "Limonadlar", en: "House lemonades" },
        { id: "coffee", ru: "Кофе", uz: "Qahva", en: "Coffee" },
        { id: "whisky", ru: "Виски", uz: "Viski", en: "Whisky" },
        { id: "vodka", ru: "Водка", uz: "Aroq", en: "Vodka" },
        { id: "beer", ru: "Пиво", uz: "Pivo", en: "Beer" },
        { id: "tequila", ru: "Текила", uz: "Tekila", en: "Tequila" },
        { id: "rum", ru: "Ром", uz: "Rom", en: "Rum" },
        { id: "cognac", ru: "Коньяк", uz: "Konyak", en: "Cognac" },
        { id: "wine", ru: "Вино", uz: "Vino", en: "Wine" },
        { id: "snacks", ru: "Снеки", uz: "Gazaklar", en: "Bar snacks" }
      ]
    };

    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const match = raw.match(/window\.FENIX_MENU\s*=\s*(\{[\s\S]*\});?\s*$/);
        if (match) {
          const parsed = JSON.parse(match[1]);
          if (parsed && parsed.sections) sections = parsed.sections;
        }
      } catch (_) {}
    }

    const rows = dbInstance.prepare(`
      SELECT id, cuisine, category, name, name_uz, name_en, price, price_alt, size, note 
      FROM menu_items 
      WHERE is_active = 1 
      ORDER BY rowid ASC
    `).all();

    if (!rows || rows.length === 0) {
      console.warn("[Menu Sync] Aborted: menu_items table is empty; preserving existing data/menu-data.js");
      return;
    }

    const items = rows.map((r) => {
      const isPreorder = (r.id === "europe-012" || r.id === "europe-013" || r.id === "europe-014" || (r.note && r.note.toLowerCase().includes("предзаказ")));
      return [
        r.id,
        r.cuisine,
        r.category,
        r.name,
        r.name_uz || "",
        r.name_en || "",
        r.price,
        r.price_alt || null,
        r.size || null,
        r.note || null,
        null,
        null,
        isPreorder ? ["preorder"] : [],
        "db"
      ];
    });

    const fileContent = `/* FENIX RESTAURANT — Auto-synced from SQLite menu_items */\nwindow.FENIX_MENU = ${JSON.stringify({ sections, items })};\n`;
    fs.writeFileSync(filePath, fileContent, "utf-8");
    console.log(`[Menu Sync] Successfully wrote ${items.length} items to data/menu-data.js`);
  } catch (err) {
    console.error("[Menu Sync Error]:", err.message);
  }
}

async function sendTelegramNotification(text, replyMarkup = null, targetChatIds = null, tokenOverride = null) {
  const token = tokenOverride || TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("[Telegram skipped — token not configured]");
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
  // If no specific courier or customer ID was targeted, do not broadcast to staff
  if (recipientIds.size === 0) {
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
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

// Option 2 + 3: Telegram Courier Group & Dedicated Courier Bot Dispatch
async function notifyCourierDeliveryOrder(order, targetCourierId = null, targetCourierName = null) {
  if (!order) return;
  const num = order.order_num || order.id;
  const name = order.customer_name || 'Клиент';
  const phone = normalizeUzPhone(order.customer_phone || '');
  const address = order.address || 'г. Ташкент';
  const total = formatPrice(order.total_price);
  const rawPay = String(order.payment_method || '').toLowerCase().trim();
  const isCash = !rawPay || rawPay.includes('налич') || rawPay.includes('cash') || rawPay.includes('naqd');
  const pay = isCash ? '💵 Наличными курьеру' : '💳 Оплачено онлайн / картой';
  const courierDisplayName = targetCourierName || order.courier_name || 'Курьер FENIX';

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

  const courierGroupId = getCourierGroupId();
  const isDirectToCourier = targetCourierId && targetCourierId !== 'group' && targetCourierId !== 'all';

  if (isDirectToCourier) {
    // 1. Direct Delivery Card sent to assigned courier's private bot (Courier App style)
    const privateText = [
      `🛵 <b>ВАМ НАЗНАЧЕН ЗАКАЗ НА ДОСТАВКУ!</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📦 <b>Заказ #WEB-${num}</b>`,
      `🏢 <b>Откуда забрать:</b> FENIX Hub (Яшнабад, 5-й проезд, 1а)`,
      `📍 <b>Куда доставить:</b> <code>${address}</code>`,
      `🧭 <b>Координаты:</b> <code>${lat.toFixed(4)}, ${lon.toFixed(4)}</code>`,
      ``,
      `👤 <b>Клиент:</b> ${name}`,
      `📞 <b>Телефон:</b> <a href="tel:${phone}">${phone}</a>`,
      ``,
      `📋 <b>Состав заказа:</b>`,
      itemsList.join('\n'),
      ``,
      `💰 <b>К получению с клиента:</b> <b>${total}</b> (${pay})`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📲 <i>Нажмите для построения маршрута в Навигаторе:</i>`,
      `<code>${yandexNaviDeep}</code>`
    ].join('\n');

    const privateMarkup = {
      inline_keyboard: [
        [
          { text: "🧭 Маршрут в Яндекс Картах", url: yandexMapsWebRoute }
        ],
        [
          { text: "✅ Заказ доставлен клиенту", callback_data: `courier_delivered:${num}` }
        ]
      ]
    };

    await sendTelegramNotification(privateText, privateMarkup, [String(targetCourierId)], COURIER_BOT_TOKEN);

    // 2. Also notify the General Courier Group so all drivers know it is assigned
    if (courierGroupId) {
      const groupAssignedText = [
        `🛵 <b>ЗАКАЗ #WEB-${num} НАЗНАЧЕН КУРЬЕРУ</b>`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 <b>Курьер:</b> <b>${courierDisplayName}</b>`,
        `📍 <b>Адрес доставки:</b> <code>${address}</code>`,
        `💰 <b>Сумма:</b> ${total} (${pay})`,
        `📋 <b>Позиций:</b> ${itemsList.length}`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `Статус: Заказ передан в доставку курьеру ${courierDisplayName}`
      ].join('\n');

      const groupAssignedMarkup = {
        inline_keyboard: [
          [
            { text: "🧭 Маршрут на карте", url: yandexMapsWebRoute }
          ]
        ]
      };

      await sendTelegramNotification(groupAssignedText, groupAssignedMarkup, [courierGroupId], COURIER_BOT_TOKEN);
    }
  } else {
    // Unassigned / Group Dispatch: posted to Courier Group with [ 🙋‍♂️ Взять заказ ]
    const text = [
      `🛵 <b>НОВЫЙ ЗАКАЗ НА ДОСТАВКУ (ОЖИДАЕТ КУРЬЕРА)</b>`,
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
          { text: "🙋‍♂️ Взять заказ", callback_data: `courier_claim:${num}` }
        ],
        [
          { text: "🧭 Маршрут в Яндекс Картах", url: yandexMapsWebRoute }
        ]
      ]
    };

    await sendTelegramNotification(text, replyMarkup, courierGroupId ? [courierGroupId] : null, COURIER_BOT_TOKEN);
  }
}

// Push status notifications to customer via Customer Bot (@FenixRestaurantBot)
async function notifyCustomerOrderStatus(order, newStatus, courierName = null) {
  if (!order || !order.user_id) return;
  const uid = String(order.user_id).trim();
  if (!/^\d+$/.test(uid) || Number(uid) < 1000) return; // Ignore synthetic non-Telegram IDs

  const num = order.order_num || order.id;
  const statusLower = String(newStatus || '').toLowerCase();
  let msg = '';

  if (statusLower.includes('пути') || statusLower.includes('курьер')) {
    const cName = courierName || order.courier_name || 'Курьер FENIX';
    msg = [
      `🛵 <b>Ваш заказ #WEB-${num} передан курьеру!</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 <b>Курьер:</b> <b>${cName}</b>`,
      `📍 <b>Адрес доставки:</b> <code>${order.address || 'Ташкент'}</code>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Курьер уже выехал к вам. Пожалуйста, оставайтесь на связи!`
    ].join('\n');
  } else if (statusLower.includes('готов')) {
    msg = [
      `👨‍🍳 <b>Ваш заказ #WEB-${num} приготовлен!</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Блюда упакованы и передаются в службу доставки FENIX.`
    ].join('\n');
  } else if (statusLower.includes('выполнен') || statusLower.includes('доставлен')) {
    msg = [
      `🎉 <b>Ваш заказ #WEB-${num} успешно доставлен!</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Благодарим за заказ в FENIX Restobar!`,
      `Приятного вам аппетита! Будем рады вашему отзыву.`
    ].join('\n');
  } else if (statusLower.includes('отменен')) {
    msg = [
      `⚠️ <b>Ваш заказ #WEB-${num} отменен.</b>`,
      `Если у вас есть вопросы, вы всегда можете написать нам здесь.`
    ].join('\n');
  }

  if (msg) {
    try {
      await sendTelegramNotification(msg, null, [uid], TELEGRAM_BOT_TOKEN);
    } catch (e) {
      console.warn(`[Customer Notification Note]: Could not push to TG user ${uid}: ${e.message}`);
    }
  }
}

// Push reservation status updates to customer via Customer Bot (@FenixRestaurantBot)
async function notifyCustomerReservationStatus(reservation, newStatus, tableAssigned = null) {
  if (!reservation || !reservation.user_id) return;
  const uid = String(reservation.user_id).trim();
  if (!/^\d+$/.test(uid) || Number(uid) < 1000) return; // Synthetic web bookings with no Telegram ID

  const code = reservation.code || reservation.id;
  const statusLower = String(newStatus || reservation.status || '').toLowerCase();
  const table = (tableAssigned !== undefined && tableAssigned !== null && tableAssigned !== '' && tableAssigned !== '—')
    ? tableAssigned
    : ((reservation.table_assigned && reservation.table_assigned !== '—') ? reservation.table_assigned : null);
  const date = reservation.res_date || '';
  const time = reservation.res_time || '';
  const guests = reservation.guests || '';
  const zone = reservation.zone || 'Основной зал';

  let msg = '';
  if (statusLower.includes('подтвержден') || statusLower.includes('принят')) {
    msg = [
      `🎉 <b>Ваша бронь #WEB-${code} подтверждена!</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📅 <b>Дата визита:</b> ${date}`,
      `⏰ <b>Время:</b> ${time}`,
      `👥 <b>Гости:</b> ${guests}`,
      `🏛 <b>Зона:</b> ${zone}`,
      table ? `🪑 <b>Назначенный стол:</b> <b>${table}</b>` : `🪑 <b>Стол:</b> Будет подготовлен к вашему приходу`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Ждем вас в FENIX Restobar & Lounge!`,
      `📍 <i>г. Ташкент, Яшнабадский р-н, ул. Хуснабад, 5 проезд, 1а</i>`,
      `📞 <b>97 185 00 10 • 97 185 00 20</b>`
    ].join('\n');
  } else if (statusLower.includes('отменен')) {
    msg = [
      `❌ <b>Ваша бронь #WEB-${code} была отменена.</b>`,
      `Если у вас изменились планы или возникли вопросы, вы всегда можете забронировать новый стол в боте или связаться с администратором: <b>97 185 00 10</b>.`
    ].join('\n');
  } else if (statusLower.includes('завершен') || statusLower.includes('визит завершен')) {
    msg = [
      `🍽 <b>Благодарим за визит в FENIX Restobar!</b>`,
      `Надеемся, вам понравилась кухня и атмосфера. Будем рады видеть вас снова!`
    ].join('\n');
  } else if (table) {
    msg = [
      `🪑 <b>Обновление по брони #WEB-${code}</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `Вам назначен стол: <b>${table}</b>`,
      `📅 <b>Дата и время:</b> ${date} в ${time}`,
      `Ждем вас в FENIX!`
    ].join('\n');
  }

  if (msg) {
    try {
      await sendTelegramNotification(msg, null, [uid], TELEGRAM_BOT_TOKEN);
    } catch (e) {
      console.warn(`[Customer Reservation Note]: Could not push to TG user ${uid}: ${e.message}`);
    }
  }
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Admin OS & API Authentication Guard
  const ADMIN_USER = process.env.ADMIN_USER || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fenix_admin_2026";
  const VALID_PASSWORDS = process.env.ADMIN_PASSWORD
    ? new Set([process.env.ADMIN_PASSWORD.trim()])
    : new Set(["fenix_admin_2026", "fenix2026"]);

  function isRequestAuthorized(req, url) {
    // 1. Check Cookie
    const cookieHeader = req.headers["cookie"] || "";
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)fenix_admin_auth=([^;]+)/);
      if (match && VALID_PASSWORDS.has(decodeURIComponent(match[1]))) {
        return true;
      }
    }
    // 2. Check X-Admin-Key header or ?key= parameter
    const keyHeader = req.headers["x-admin-key"] || url.searchParams.get("key");
    if (VALID_PASSWORDS.has(keyHeader)) return true;

    // 3. Check Authorization header (Bearer or Basic)
    const authHeader = req.headers["authorization"] || "";
    if (authHeader.startsWith("Bearer ")) {
      if (VALID_PASSWORDS.has(authHeader.slice(7).trim())) return true;
    }
    if (authHeader.startsWith("Basic ")) {
      try {
        const credentials = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
        const [u, p] = credentials.split(":");
        if ((u === ADMIN_USER || u === "fenix" || u === "admin") && VALID_PASSWORDS.has(p)) {
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

    if ((cleanUser === ADMIN_USER.toLowerCase() || cleanUser === "admin" || cleanUser === "fenix") && VALID_PASSWORDS.has(cleanPass)) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Set-Cookie": `fenix_admin_auth=${encodeURIComponent(cleanPass)}; Path=/; Max-Age=2592000; SameSite=Lax`
      });
      res.end(JSON.stringify({
        ok: true,
        token: cleanPass,
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

  // ── GEOCODING & MAP PROXY (Yandex Eats / Uzum Tezkor style for Tashkent) ──
  if (req.method === "GET" && url.pathname === "/api/geo/reverse") {
    const lat = parseFloat(url.searchParams.get("lat"));
    const lon = parseFloat(url.searchParams.get("lon"));
    const lang = url.searchParams.get("lang") || "ru";
    if (isNaN(lat) || isNaN(lon)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Invalid coordinates" }));
      return;
    }
    const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)},${lang}`;
    if (reverseGeoCache.has(cacheKey)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(reverseGeoCache.get(cacheKey)));
      return;
    }
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=${lang}`;
      const nomRes = await fetch(nomUrl, {
        headers: { "User-Agent": "FenixRestobarApp/2.0 (tashkent delivery map)" },
        signal: AbortSignal.timeout(4500)
      });
      const data = await nomRes.json();
      const a = data.address || {};
      const road = a.road || a.street || a.pedestrian || a.suburb || a.neighbourhood || "";
      const house = a.house_number ? (lang === "uz" ? `${a.house_number}-uy` : `д. ${a.house_number}`) : "";
      const street = [road, house].filter(Boolean).join(", ") || data.name || (lang === "uz" ? "Xaritadagi nuqta" : "Точка на карте");
      const district = a.district || a.city_district || a.suburb || (lang === "uz" ? "Toshkent" : "Ташкент");
      const city = a.city || (lang === "uz" ? "Toshkent sh." : "г. Ташкент");
      const full = [city, district, street].filter(Boolean).join(", ");
      const payload = { ok: true, full, street, district, city, lat, lon };
      if (reverseGeoCache.size > 2000) reverseGeoCache.clear();
      reverseGeoCache.set(cacheKey, payload);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
      return;
    } catch (err) {
      const fallback = {
        ok: true,
        full: `${lang === "uz" ? "Toshkent, koordinatalar" : "Ташкент, координаты"} (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
        street: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        district: lang === "uz" ? "Toshkent" : "Ташкент",
        city: lang === "uz" ? "Toshkent sh." : "г. Ташкент",
        lat,
        lon
      };
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(fallback));
      return;
    }
  }

  if (req.method === "GET" && url.pathname === "/api/geo/search") {
    const q = (url.searchParams.get("q") || "").trim();
    const lang = url.searchParams.get("lang") || "ru";
    if (!q || q.length < 2) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, results: [] }));
      return;
    }
    const cacheKey = `${q.toLowerCase()},${lang}`;
    if (searchGeoCache.has(cacheKey)) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(searchGeoCache.get(cacheKey)));
      return;
    }
    let results = [];
    try {
      const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=41.311081&lon=69.240562&limit=10`;
      const pRes = await fetch(pUrl, { signal: AbortSignal.timeout(3500) });
      const pData = await pRes.json();
      for (const f of (pData.features || [])) {
        const p = f.properties || {};
        const coords = f.geometry?.coordinates || [];
        const lat = coords[1];
        const lon = coords[0];
        if (lat >= 41.10 && lat <= 41.45 && lon >= 69.05 && lon <= 69.50) {
          results.push({
            title: p.name || p.street || q,
            subtitle: [p.street, p.district, p.city].filter(Boolean).join(", ") || (lang === "uz" ? "Toshkent" : "Ташкент"),
            street: p.street || p.name || "",
            district: p.district || "",
            lat,
            lon
          });
        }
      }
    } catch (_) {}

    if (results.length < 2) {
      try {
        const nomSearchUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent("Ташкент " + q)}&countrycodes=uz&limit=6&accept-language=${lang}`;
        const nRes = await fetch(nomSearchUrl, {
          headers: { "User-Agent": "FenixRestobarApp/2.0 (tashkent delivery map search)" },
          signal: AbortSignal.timeout(3500)
        });
        const nData = await nRes.json();
        for (const item of (nData || [])) {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          results.push({
            title: item.name,
            subtitle: (item.display_name || "").split(",").slice(1, 4).join(",").trim(),
            street: item.name,
            district: "",
            lat,
            lon
          });
        }
      } catch (_) {}
    }

    // Deduplicate
    const seen = new Set();
    const finalResults = [];
    for (const r of results) {
      const k = `${r.title}|${r.lat.toFixed(3)}|${r.lon.toFixed(3)}`;
      if (!seen.has(k)) {
        seen.add(k);
        finalResults.push(r);
      }
    }
    const payload = { ok: true, results: finalResults.slice(0, 6) };
    if (searchGeoCache.size > 1000) searchGeoCache.clear();
    searchGeoCache.set(cacheKey, payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
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
            const priceMap = new Map();
            try {
              const menuRows = db.prepare("SELECT id, name, price FROM menu_items WHERE is_active = 1").all();
              for (const row of menuRows) {
                if (row.id) priceMap.set(String(row.id).toLowerCase().trim(), Number(row.price || 0));
                if (row.name) priceMap.set(String(row.name).toLowerCase().trim(), Number(row.price || 0));
              }
            } catch (_) {}
            const items = normalizeOrderItems(ord.items_json, priceMap);
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
              const priceMap = new Map();
              try {
                const menuRows = db.prepare("SELECT id, name, price FROM menu_items WHERE is_active = 1").all();
                for (const row of menuRows) {
                  if (row.id) priceMap.set(String(row.id).toLowerCase().trim(), Number(row.price || 0));
                  if (row.name) priceMap.set(String(row.name).toLowerCase().trim(), Number(row.price || 0));
                }
              } catch (_) {}
              const items = normalizeOrderItems(ord.items_json, priceMap);
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

  
function normalizeOrderItems(rawItems, priceMap = null) {
  if (!rawItems) return [];
  let parsed = rawItems;
  if (typeof rawItems === "string") {
    try { parsed = JSON.parse(rawItems); } catch (_) { return []; }
  }
  const result = [];
  if (Array.isArray(parsed)) {
    for (const it of parsed) {
      if (!it) continue;
      const name = it.name || it.n || it.id || "Позиция";
      const qty = Number(it.count || it.qty || it.quantity || 1);
      let price = Number(it.price || 0);
      if (!price && priceMap && priceMap.has(String(name).toLowerCase().trim())) {
        price = priceMap.get(String(name).toLowerCase().trim());
      }
      result.push({ name, qty, price });
    }
  } else if (parsed && typeof parsed === "object") {
    for (const [key, val] of Object.entries(parsed)) {
      const isValObj = val && typeof val === "object";
      const name = isValObj ? (val.name || val.n || val.id || (isNaN(Number(key)) ? key : "Позиция")) : key;
      const qty = isValObj ? Number(val.qty || val.count || 1) : Number(val || 1);
      let price = isValObj ? Number(val.price || 0) : 0;
      if (!price && priceMap && priceMap.has(String(name).toLowerCase().trim())) {
        price = priceMap.get(String(name).toLowerCase().trim());
      }
      result.push({ name, qty, price });
    }
  }
  return result;
}

// Customer Profile API (Unified Mini App & Telegram Bot Sync)
  if (req.method === "GET" && url.pathname === "/api/profile") {
    const rawInitData = (req.headers["x-telegram-init-data"] || "").trim();
    let verifiedUser = null;
    if (rawInitData) {
      verifiedUser = verifyTelegramInitData(rawInitData, TELEGRAM_BOT_TOKEN);
      if (!verifiedUser) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid Telegram initData signature" }));
        return;
      }
    }

    const rawUid = verifiedUser ? String(verifiedUser.id) : (url.searchParams.get("user_id") || "").trim();
    const rawPhone = normalizeUzPhone(url.searchParams.get("phone") || "");
    const uid = rawUid ? parseInt(rawUid, 10) : null;

    if (!uid && !rawPhone) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing user_id or phone" }));
      return;
    }

    let customer = null;
    let orders = [];
    let reservations = [];
    let cashback = 0;

    if (db) {
      try {
        if (uid) {
          customer = db.prepare("SELECT * FROM customers WHERE user_id = ?").get(uid);
        }
        if (!customer && rawPhone) {
          customer = db.prepare("SELECT * FROM customers WHERE phone = ?").get(rawPhone);
        }

        // Fetch menu price map for item price enrichment
        const priceMap = new Map();
        try {
          const menuRows = db.prepare("SELECT id, name, price FROM menu_items WHERE is_active = 1").all();
          for (const row of menuRows) {
            if (row.id) priceMap.set(String(row.id).toLowerCase().trim(), Number(row.price || 0));
            if (row.name) priceMap.set(String(row.name).toLowerCase().trim(), Number(row.price || 0));
          }
        } catch (_) {}

        // Fetch recent orders (up to 50 for client-side pagination & Show More)
        const ordStmt = db.prepare(`
          SELECT order_num, order_type, address, total_price, status, created_at, items_json
          FROM orders
          WHERE (user_id = ? AND user_id > 0) OR (customer_phone = ? AND customer_phone != '')
          ORDER BY id DESC LIMIT 50
        `);
        const ordRows = ordStmt.all(uid || -1, rawPhone || (customer?.phone || ""));
        orders = ordRows.map(o => {
          const items = normalizeOrderItems(o.items_json, priceMap);
          return {
            order_num: o.order_num,
            order_type: o.order_type,
            address: o.address,
            total_price: o.total_price,
            status: o.status,
            created_at: o.created_at,
            items
          };
        });

        // Calculate 5% cashback on completed delivery/pickup orders
        try {
          const cashStmt = db.prepare(`
            SELECT SUM(total_price) as sum_total
            FROM orders
            WHERE ((user_id = ? AND user_id > 0) OR (customer_phone = ? AND customer_phone != ''))
              AND (status LIKE '%выполнен%' OR status LIKE '%доставлен%')
          `);
          const cashRow = cashStmt.get(uid || -1, rawPhone || (customer?.phone || ""));
          const totalSpent = cashRow?.sum_total || 0;
          cashback = Math.round(totalSpent * 0.05);
        } catch (_) {}

        // Fetch recent reservations
        const resStmt = db.prepare(`
          SELECT code, customer_name, customer_phone, res_date, res_time, guests, zone, table_assigned, status, created_at
          FROM reservations
          WHERE (user_id = ? AND user_id > 0) OR (customer_phone = ? AND customer_phone != '')
          ORDER BY id DESC LIMIT 20
        `);
        reservations = resStmt.all(uid || -1, rawPhone || (customer?.phone || ""));
      } catch (err) {
        console.error("[Profile API Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      profile: customer ? {
        user_id: customer.user_id,
        full_name: customer.full_name || "",
        phone: customer.phone || "",
        default_address: customer.default_address || "",
        language: customer.language || "ru",
        bonus_points: (customer.bonus_points && customer.bonus_points > 0) ? customer.bonus_points : cashback,
        created_at: customer.created_at,
        updated_at: customer.updated_at
      } : null,
      orders,
      reservations
    }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/profile") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}

    const rawInitData = (req.headers["x-telegram-init-data"] || payload.initData || "").trim();
    let verifiedUser = null;
    if (rawInitData) {
      verifiedUser = verifyTelegramInitData(rawInitData, TELEGRAM_BOT_TOKEN);
      if (!verifiedUser) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid Telegram initData signature" }));
        return;
      }
    }

    const uid = verifiedUser ? verifiedUser.id : (payload.user_id ? parseInt(String(payload.user_id).trim(), 10) : null);
    const name = (payload.full_name || payload.name || "").trim();
    const phone = normalizeUzPhone(payload.phone || "");
    const address = (payload.default_address || payload.address || "").trim();
    const language = (payload.language || "ru").trim().toLowerCase();

    if (!uid && !phone) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "user_id or phone is required" }));
      return;
    }

    if (db) {
      try {
        if (uid) {
          db.prepare(`
            INSERT INTO customers (user_id, full_name, phone, default_address, language, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
              full_name = CASE WHEN excluded.full_name != '' THEN excluded.full_name ELSE customers.full_name END,
              phone = CASE WHEN excluded.phone != '' THEN excluded.phone ELSE customers.phone END,
              default_address = CASE WHEN excluded.default_address != '' THEN excluded.default_address ELSE customers.default_address END,
              language = CASE WHEN excluded.language != '' THEN excluded.language ELSE customers.language END,
              updated_at = CURRENT_TIMESTAMP
          `).run(uid, name, phone, address, language);
        } else if (phone) {
          const existing = db.prepare("SELECT user_id FROM customers WHERE phone = ? LIMIT 1").get(phone);
          if (existing) {
            db.prepare(`
              UPDATE customers SET
                full_name = CASE WHEN ? != '' THEN ? ELSE full_name END,
                default_address = CASE WHEN ? != '' THEN ? ELSE default_address END,
                language = CASE WHEN ? != '' THEN ? ELSE language END,
                updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?
            `).run(name, name, address, address, language, language, existing.user_id);
          }
        }
        console.log(`[Profile API] Updated profile for user_id=${uid}, phone=${phone}`);
      } catch (err) {
        console.error("[Profile Update Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      message: "Profile updated successfully",
      profile: {
        user_id: uid,
        full_name: name,
        phone,
        default_address: address,
        language
      }
    }));
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
                 created_at, status, courier_name, courier_id 
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
            status: r.status,
            courier: r.courier_name || null,
            courierName: r.courier_name || null,
            courierId: r.courier_id || null,
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
        const row = num
          ? db.prepare("SELECT * FROM orders WHERE order_num = ? OR id = ?").get(num, num)
          : db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
        if (row) {
          if (statusLower.includes('пути') || statusLower.includes('курьер')) {
            notifyCourierDeliveryOrder(row, payload.courierId);
          }
          notifyCustomerOrderStatus(row, status, payload.courierName);
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
        const isGroup = !courierId || courierId === 'group' || courierId === 'all';
        let actualTelegramTargetId = courierId;
        if (isGroup) {
          db.prepare("UPDATE orders SET status = 'в пути' WHERE order_num = ? OR id = ?").run(num, num);
        } else {
          db.prepare("UPDATE orders SET status = 'в пути', courier_id = ?, courier_name = ? WHERE order_num = ? OR id = ?")
            .run(String(courierId), courierName || 'Курьер Fenix', num, num);
          try {
            const sRow = db.prepare("SELECT user_id, telegram_id FROM staff WHERE user_id = ?").get(String(courierId));
            if (sRow && sRow.telegram_id && /^\d+$/.test(String(sRow.telegram_id).trim())) {
              actualTelegramTargetId = String(sRow.telegram_id).trim();
            }
          } catch (_) {}
        }
        const row = db.prepare("SELECT * FROM orders WHERE order_num = ? OR id = ?").get(num, num);
        if (row) {
          await notifyCourierDeliveryOrder(row, actualTelegramTargetId, courierName);
          await notifyCustomerOrderStatus(row, 'в пути', courierName);
        }
      } catch (err) {
        console.error("[Courier Dispatch Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, status: 'в пути', courierName: courierName || 'Курьер' }));
    return;
  }

  // 3b. Admin List Couriers (from staff table & courier group status)
  if (req.method === "GET" && url.pathname === "/api/admin/couriers") {
    let couriers = [];
    let courierGroupId = null;
    let courierGroupTitle = null;
    if (db) {
      try {
        couriers = db.prepare("SELECT user_id, user_name, full_name, role, phone, shift, status, telegram_id, vehicle FROM staff WHERE LOWER(role) LIKE '%курьер%' OR LOWER(role) LIKE '%courier%' OR role = 'Курьер'").all();
        if (couriers.length === 0) {
          couriers = db.prepare("SELECT user_id, user_name, full_name, role, phone, shift, status, telegram_id, vehicle FROM staff").all();
        }
      } catch (_) {}
      try {
        const row = db.prepare("SELECT value FROM app_settings WHERE key = 'courier_group_id'").get();
        if (row && row.value) courierGroupId = row.value;
        const rowT = db.prepare("SELECT value FROM app_settings WHERE key = 'courier_group_title'").get();
        if (rowT && rowT.value) courierGroupTitle = rowT.value;
      } catch (_) {}
    }
    if (couriers.length === 0) {
      couriers = [
        { user_id: 106, user_name: 'courier_yashnabad', full_name: 'Курьер 1 (Яшнабад)', role: 'Курьер', phone: '+998 91 234 56 78', shift: '10:00 – 22:00', status: 'online', vehicle: 'Автомобиль' },
        { user_id: 107, user_name: 'courier_center', full_name: 'Курьер 2 (Центр)', role: 'Курьер', phone: '+998 97 876 54 32', shift: '11:00 – 23:00', status: 'online', vehicle: 'Скутер' },
      ];
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      ok: true,
      couriers,
      courierGroupId,
      courierGroupTitle,
      courierGroup: {
        id: courierGroupId,
        title: courierGroupTitle || "Группа курьеров FENIX",
        configured: Boolean(courierGroupId)
      }
    }));
    return;
  }

  // 3b-2. Set Courier Group from Admin UI
  if (req.method === "POST" && url.pathname === "/api/admin/settings/courier-group") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const { groupId, title } = payload;
    if (db && groupId) {
      try {
        db.prepare(`
          INSERT INTO app_settings (key, value, updated_at) VALUES ('courier_group_id', ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `).run(String(groupId));
        if (title) {
          db.prepare(`
            INSERT INTO app_settings (key, value, updated_at) VALUES ('courier_group_title', ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
          `).run(String(title));
        }
      } catch (e) {
        console.error("Error setting courier group:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, groupId, title }));
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
                 res_date, res_time, guests, zone, created_at, status, table_assigned 
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
          status: r.status,
          table: r.table_assigned || '—'
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

    const { id, code, status, table } = payload;
    if ((!status && table === undefined) || (!id && !code)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: "Missing required fields (id/code, status/table)" }));
      return;
    }

    const finalTable = (table === "" || table === "—") ? null : table;
    if (db) {
      try {
        const num = code || (typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) : (typeof id === 'number' && id > 100 ? id : null));
        let prevRow = null;
        if (num) {
          prevRow = db.prepare("SELECT * FROM reservations WHERE code = ? OR id = ?").get(num, num);
          if (status && table !== undefined) {
            db.prepare("UPDATE reservations SET status = ?, table_assigned = ? WHERE code = ? OR id = ?").run(status, finalTable, num, num);
          } else if (status) {
            db.prepare("UPDATE reservations SET status = ? WHERE code = ? OR id = ?").run(status, num, num);
          } else if (table !== undefined) {
            db.prepare("UPDATE reservations SET table_assigned = ? WHERE code = ? OR id = ?").run(finalTable, num, num);
          }
        } else if (id) {
          prevRow = db.prepare("SELECT * FROM reservations WHERE id = ?").get(id);
          if (status && table !== undefined) {
            db.prepare("UPDATE reservations SET status = ?, table_assigned = ? WHERE id = ?").run(status, finalTable, id);
          } else if (status) {
            db.prepare("UPDATE reservations SET status = ? WHERE id = ?").run(status, id);
          } else if (table !== undefined) {
            db.prepare("UPDATE reservations SET table_assigned = ? WHERE id = ?").run(finalTable, id);
          }
        }
        if (prevRow) {
          notifyCustomerReservationStatus(prevRow, status || prevRow.status, finalTable !== undefined ? finalTable : prevRow.table_assigned);
        }
        console.log(`[Admin] Updated reservation ${id || code} status="${status}", table="${finalTable}"`);
      } catch (err) {
        console.error("[Admin Reservation Status Error]:", err.message);
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, status, table }));
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

  // 8a. Admin Menu Items Management & Price Sync
  if (req.method === "GET" && url.pathname === "/api/admin/menu/items") {
    let items = [];
    if (db) {
      try {
        items = db.prepare(`
          SELECT id, cuisine, category, name, name_uz, name_en, price, price_alt, size, note, is_active 
          FROM menu_items 
          WHERE is_active = 1 
          ORDER BY rowid ASC
        `).all();
      } catch (e) {
        console.error("[Admin Menu Items Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, items }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/menu/price") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const { id, name, price } = payload;
    const priceNum = parseInt(price, 10);
    if (!priceNum || (!id && !name)) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing required fields (id or name, price)" }));
      return;
    }
    if (db) {
      try {
        if (id) {
          db.prepare("UPDATE menu_items SET price = ? WHERE id = ?").run(priceNum, id);
        } else {
          db.prepare("UPDATE menu_items SET price = ? WHERE name = ?").run(priceNum, name);
        }
        syncMenuFiles(db);
        console.log(`[Admin Menu] Updated price for ${name || id} to ${priceNum} UZS`);
      } catch (e) {
        console.error("[Admin Menu Price Update Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, id, name, price: priceNum }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/menu/add") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const { name, name_uz, name_en, cuisine, category, price, size, note } = payload;
    const priceNum = parseInt(price, 10);
    if (!name || !priceNum || !cuisine || !category) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing required fields (name, price, cuisine, category)" }));
      return;
    }
    const newId = `${cuisine}-${Date.now().toString(36)}`;
    if (db) {
      try {
        db.prepare(`
          INSERT INTO menu_items (id, cuisine, category, name, name_uz, name_en, price, size, note, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(newId, cuisine, category, name.trim(), (name_uz || "").trim(), (name_en || "").trim(), priceNum, size || null, note || null);
        syncMenuFiles(db);
        console.log(`[Admin Menu] Added new dish ${name} (${newId})`);
      } catch (e) {
        console.error("[Admin Menu Add Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, item: { id: newId, name, cuisine, category, price: priceNum } }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/admin/menu/delete") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const { id, name } = payload;
    if (!id && !name) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Missing required fields (id or name)" }));
      return;
    }
    if (db) {
      try {
        if (id) {
          db.prepare("UPDATE menu_items SET is_active = 0 WHERE id = ?").run(id);
        } else {
          db.prepare("UPDATE menu_items SET is_active = 0 WHERE name = ?").run(name);
        }
        syncMenuFiles(db);
        console.log(`[Admin Menu] Deactivated dish ${name || id}`);
      } catch (e) {
        console.error("[Admin Menu Delete Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, id, name }));
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
        try { db.exec("ALTER TABLE staff ADD COLUMN phone TEXT;"); } catch (_) {}
        try { db.exec("ALTER TABLE staff ADD COLUMN shift TEXT;"); } catch (_) {}
        try { db.exec("ALTER TABLE staff ADD COLUMN status TEXT;"); } catch (_) {}
        try { db.exec("ALTER TABLE staff ADD COLUMN telegram_id TEXT;"); } catch (_) {}
        try { db.exec("ALTER TABLE staff ADD COLUMN vehicle TEXT;"); } catch (_) {}

        // Backfill existing rows if missing phone/shift/status
        try {
          db.prepare("UPDATE staff SET phone = '+998 90 019 57 65' WHERE phone IS NULL OR phone = ''").run();
          db.prepare("UPDATE staff SET shift = '11:00 – 23:00' WHERE shift IS NULL OR shift = ''").run();
          db.prepare("UPDATE staff SET status = 'online' WHERE status IS NULL OR status = ''").run();
        } catch (_) {}

        const rows = db.prepare("SELECT user_id, user_name, full_name, role, registered_at, phone, shift, status, telegram_id, vehicle FROM staff ORDER BY registered_at ASC").all();
        staff = rows;
      } catch (e) {
        console.error("[Staff Error]:", e.message);
      }
    }
    // Seed real operational staff if table is currently empty
    if (staff.length === 0 && db) {
      const defaultTeam = [
        { user_id: '101', user_name: 'almasov_sh', full_name: 'Алмасов Ш.', role: 'Диспетчер', phone: '+998 90 123 45 67', shift: '08:00 – 23:00', status: 'online', telegram_id: '101', vehicle: '', registered_at: '2026-11-01 08:00:00' },
        { user_id: '102', user_name: 'fenix_chef', full_name: 'Шеф Fenix', role: 'Шеф-повар', phone: '+998 90 987 65 43', shift: '09:00 – 22:00', status: 'online', telegram_id: '102', vehicle: '', registered_at: '2026-11-01 09:00:00' },
        { user_id: '103', user_name: 'manager_fenix', full_name: 'Менеджер смены', role: 'Менеджер', phone: '+998 93 555 44 33', shift: '10:00 – 23:00', status: 'online', telegram_id: '103', vehicle: '', registered_at: '2026-11-01 10:00:00' },
        { user_id: '104', user_name: 'waiter_1', full_name: 'Официант Зала 1', role: 'Официант', phone: '+998 91 111 22 33', shift: '11:00 – 23:00', status: 'online', telegram_id: '104', vehicle: '', registered_at: '2026-11-01 11:00:00' },
        { user_id: '105', user_name: 'waiter_2', full_name: 'Официант Зала 2', role: 'Официант', phone: '+998 91 222 33 44', shift: '11:00 – 23:00', status: 'online', telegram_id: '105', vehicle: '', registered_at: '2026-11-01 11:00:00' },
        { user_id: '106', user_name: 'courier_yashnabad', full_name: 'Курьер 1 (Яшнабад)', role: 'Курьер', phone: '+998 91 234 56 78', shift: '10:00 – 22:00', status: 'online', telegram_id: '106', vehicle: 'Автомобиль', registered_at: '2026-11-01 10:00:00' },
        { user_id: '107', user_name: 'courier_center', full_name: 'Курьер 2 (Центр)', role: 'Курьер', phone: '+998 97 876 54 32', shift: '11:00 – 23:00', status: 'online', telegram_id: '107', vehicle: 'Скутер', registered_at: '2026-11-01 11:00:00' }
      ];
      try {
        const stmt = db.prepare("INSERT OR IGNORE INTO staff (user_id, user_name, full_name, role, phone, shift, status, telegram_id, vehicle, registered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        for (const s of defaultTeam) {
          stmt.run(s.user_id, s.user_name, s.full_name, s.role, s.phone, s.shift, s.status, s.telegram_id, s.vehicle, s.registered_at);
        }
        staff = db.prepare("SELECT user_id, user_name, full_name, role, registered_at, phone, shift, status, telegram_id, vehicle FROM staff ORDER BY registered_at ASC").all();
      } catch (e) {
        console.error("[Staff Seed Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, staff }));
    return;
  }

  // Add or Update Staff Member
  if (req.method === "POST" && url.pathname === "/api/admin/staff") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    let { full_name, role, user_name, telegram_id, phone, shift, status, vehicle, user_id } = payload;
    if (db && full_name && role) {
      try {
        let cleanUsername = (user_name || '').trim();
        if (cleanUsername.startsWith('@')) cleanUsername = cleanUsername.slice(1);

        let cleanTgId = (telegram_id ? String(telegram_id).trim() : '');
        let assignedId = user_id || cleanTgId || (cleanUsername && /^\d+$/.test(cleanUsername) ? cleanUsername : String(Math.floor(100000 + Math.random() * 900000)));

        const cleanPhone = (phone || '').trim();
        const cleanShift = (shift || '11:00 – 23:00').trim();
        const cleanStatus = (status || 'online').trim();
        const cleanVehicle = (vehicle || '').trim();

        // Check if member exists by user_id or username
        let existing = null;
        if (user_id) {
          existing = db.prepare("SELECT user_id FROM staff WHERE user_id = ?").get(String(user_id));
        }
        if (!existing && (assignedId || cleanUsername)) {
          existing = db.prepare("SELECT user_id FROM staff WHERE user_id = ? OR (user_name != '' AND user_name = ?)").get(String(assignedId), cleanUsername);
        }

        if (existing) {
          db.prepare(`
            UPDATE staff
            SET full_name = ?, role = ?, phone = ?, shift = ?, status = ?, telegram_id = ?, vehicle = ?, user_name = ?
            WHERE user_id = ?
          `).run(full_name.trim(), role.trim(), cleanPhone, cleanShift, cleanStatus, cleanTgId, cleanVehicle, cleanUsername, existing.user_id);
          console.log(`[Admin Staff] Updated staff member: ${full_name} (${role}), user_id: ${existing.user_id}`);
        } else {
          db.prepare(`
            INSERT INTO staff (user_id, user_name, full_name, role, registered_at, phone, shift, status, telegram_id, vehicle)
            VALUES (?, ?, ?, ?, datetime('now', 'localtime'), ?, ?, ?, ?, ?)
          `).run(
            String(assignedId),
            cleanUsername,
            full_name.trim(),
            role.trim(),
            cleanPhone,
            cleanShift,
            cleanStatus,
            cleanTgId,
            cleanVehicle
          );
          console.log(`[Admin Staff] Added staff member: ${full_name} (${role}), user_id: ${assignedId}, TG: @${cleanUsername} (ID: ${cleanTgId})`);
        }
      } catch (e) {
        console.error("[Staff Add/Update Error]:", e.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
        return;
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Delete Staff Member
  if ((req.method === "POST" || req.method === "DELETE") && (url.pathname === "/api/admin/staff/delete" || (req.method === "DELETE" && url.pathname === "/api/admin/staff"))) {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const userId = payload.user_id || payload.userId || url.searchParams.get("userId");
    if (db && userId) {
      try {
        db.prepare("DELETE FROM staff WHERE user_id = ?").run(String(userId));
        console.log(`[Admin Staff] Deleted member with user_id: ${userId}`);
      } catch (e) {
        console.error("[Staff Delete Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // Toggle or Update Staff Status (online / off)
  if (req.method === "POST" && url.pathname === "/api/admin/staff/status") {
    let rawBody = "";
    for await (const chunk of req) rawBody += chunk;
    let payload = {};
    try { payload = JSON.parse(rawBody || "{}"); } catch (_) {}
    const { userId, status } = payload;
    if (db && userId && status) {
      try {
        db.prepare("UPDATE staff SET status = ? WHERE user_id = ?").run(status, String(userId));
        console.log(`[Admin Staff] Updated status for user_id ${userId} to "${status}"`);
      } catch (e) {
        console.error("[Staff Status Error]:", e.message);
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, status }));
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

          // Auto-save customer profile from reservation
          const tgUid = data.telegramUserId ? Number(data.telegramUserId) : null;
          if (tgUid && tgUid > 1000) {
            try {
              db.prepare(`
                INSERT INTO customers (user_id, full_name, phone, updated_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id) DO UPDATE SET
                  full_name = CASE WHEN excluded.full_name != '' THEN excluded.full_name ELSE customers.full_name END,
                  phone = CASE WHEN excluded.phone != '' THEN excluded.phone ELSE customers.phone END,
                  updated_at = CURRENT_TIMESTAMP
              `).run(tgUid, data.name || "", data.phone || "");
            } catch (_) {}
          }
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

      // Forward alert to staff
      try {
        await sendTelegramNotification(msg, null, getStaffChatIds());
      } catch (err) {
        console.error("[Telegram Reservation Alert Error]:", err.message);
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, id: `WEB-${code}`, code, codeFormatted: `WEB-${code}` }));
      return;
    }

    if (endpoint === "orders") {
      const orderNum = Math.floor(1000 + Math.random() * 9000);
      let calculatedItemsTotal = 0;
      const itemsObj = {};
      const itemsLines = [];

      // Authoritative SQLite menu_items price lookup
      const priceMap = new Map();
      if (db) {
        try {
          const menuRows = db.prepare("SELECT id, name, price FROM menu_items WHERE is_active = 1").all();
          for (const row of menuRows) {
            if (row.id) priceMap.set(String(row.id).toLowerCase().trim(), Number(row.price || 0));
            if (row.name) priceMap.set(String(row.name).toLowerCase().trim(), Number(row.price || 0));
          }
        } catch (err) {
          console.warn("[Order Validation] Failed to query menu_items for price validation:", err.message);
        }
      }

      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const qty = Number(item.qty || item.count || item.quantity || 1);
          const rawId = String(item.id || "").toLowerCase().trim();
          const dishName = item.name?.ru || item.name || item.id || "Позиция";
          const rawName = String(dishName).toLowerCase().trim();

          let price = 0;
          if (priceMap.has(rawId)) {
            price = priceMap.get(rawId);
          } else if (priceMap.has(rawName)) {
            price = priceMap.get(rawName);
          } else {
            const cleanRaw = rawName.replace(/[^a-zа-яё0-9]/gi, '');
            for (const [k, v] of priceMap.entries()) {
              if (k.replace(/[^a-zа-яё0-9]/gi, '') === cleanRaw) {
                price = v;
                break;
              }
            }
          }
          if (price === 0 && Number(item.price || 0) > 0) {
            price = Number(item.price);
          }

          calculatedItemsTotal += price * qty;
          itemsObj[dishName] = qty;
          itemsLines.push(`- ${dishName} x ${qty}${price > 0 ? " = " + formatPrice(price * qty) : ""}`);
        }
      } else if (data.items && typeof data.items === "object") {
        for (const [dishName, val] of Object.entries(data.items)) {
          const qty = typeof val === "object" ? Number(val.qty || val.count || val.quantity || 1) : Number(val || 1);
          const rawName = String(dishName).toLowerCase().trim();

          let price = 0;
          if (priceMap.has(rawName)) {
            price = priceMap.get(rawName);
          } else {
            const cleanRaw = rawName.replace(/[^a-zа-яё0-9]/gi, '');
            for (const [k, v] of priceMap.entries()) {
              if (k.replace(/[^a-zа-яё0-9]/gi, '') === cleanRaw) {
                price = v;
                break;
              }
            }
          }
          if (price === 0 && typeof val === "object" && Number(val.price || 0) > 0) {
            price = Number(val.price);
          }

          if (price > 0) calculatedItemsTotal += price * qty;
          itemsObj[dishName] = qty;
          itemsLines.push(`- ${dishName} x ${qty}${price > 0 ? " = " + formatPrice(price * qty) : ""}`);
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

      // Final total price: only honor Number(data.total) override when isAdmin is true (Admin OS).
      // For all public/customer orders, always set finalTotal = calculatedItemsTotal + deliveryFee.
      let finalTotal = calculatedItemsTotal + deliveryFee;
      if (isAdmin && Number(data.total) > 0) {
        finalTotal = Number(data.total);
      }

      const address = data.address || (isDelivery ? "Уточняется" : orderType === "Заказ в зале" ? "В зале" : "Самовывоз");
      const paymentMethod = data.paymentMethod || data.payment || "Наличными";

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

          // Auto-save customer profile from order
          const tgUid = data.telegramUserId ? Number(data.telegramUserId) : null;
          if (tgUid && tgUid > 1000) {
            try {
              db.prepare(`
                INSERT INTO customers (user_id, full_name, phone, default_address, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id) DO UPDATE SET
                  full_name = CASE WHEN excluded.full_name != '' THEN excluded.full_name ELSE customers.full_name END,
                  phone = CASE WHEN excluded.phone != '' THEN excluded.phone ELSE customers.phone END,
                  default_address = CASE WHEN excluded.default_address != '' THEN excluded.default_address ELSE customers.default_address END,
                  updated_at = CURRENT_TIMESTAMP
              `).run(tgUid, data.name || "", data.phone || "", (address !== "Уточняется" && address !== "В зале" && address !== "Самовывоз") ? address : "");
            } catch (_) {}
          }
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

      // Auto-dispatch delivery orders directly to the Telegram Courier Group
      if (isDelivery) {
        try {
          const orderRow = {
            order_num: orderNum,
            customer_name: data.name,
            customer_phone: data.phone,
            address: address,
            payment_method: paymentMethod,
            items_json: JSON.stringify(itemsObj),
            total_price: finalTotal,
            status: "новый (с сайта)"
          };
          await notifyCourierDeliveryOrder(orderRow, "group");
          console.log(`[Auto-Courier] Automatically dispatched delivery order #WEB-${orderNum} to courier group!`);
        } catch (err) {
          console.error("[Auto Courier Dispatch Error]:", err.message);
        }
      } else {
        // Forward pickup and hall orders to staff / manager
        try {
          await sendTelegramNotification(msg, null, getStaffChatIds());
        } catch (err) {
          console.error("[Telegram Pickup Alert Error]:", err.message);
        }
      }

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

      // Forward alert to staff
      try {
        await sendTelegramNotification(msg, null, getStaffChatIds());
      } catch (err) {
        console.error("[Telegram Event Alert Error]:", err.message);
      }

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
    const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
    if (reqPath.includes("menu-data.js") || reqPath.includes("app.html")) {
      headers["Cache-Control"] = "no-cache, must-revalidate";
    }
    res.writeHead(200, headers);
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
