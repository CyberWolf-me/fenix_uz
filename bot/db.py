import sqlite3
import json
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent / "fenix_restaurant.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA busy_timeout = 5000;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    
    # Orders table
    c.execute("""
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
    )
    """)
    
    # Reservations table
    c.execute("""
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
    )
    """)
    
    # Admin / Staff table
    c.execute("""
    CREATE TABLE IF NOT EXISTS staff (
        user_id INTEGER PRIMARY KEY,
        user_name TEXT,
        full_name TEXT,
        role TEXT DEFAULT 'admin',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Persistent carts table
    c.execute("""
    CREATE TABLE IF NOT EXISTS user_carts (
        user_id INTEGER PRIMARY KEY,
        cart_json TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Event and Banquet Inquiries (from Website & Bot)
    c.execute("""
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
    )
    """)

    # User settings (e.g. language)
    c.execute("""
    CREATE TABLE IF NOT EXISTS user_settings (
        user_id INTEGER PRIMARY KEY,
        language TEXT DEFAULT 'ru',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # App settings & courier group channel
    c.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    conn.commit()
    conn.close()

# Cart management
def get_user_cart(user_id: int) -> dict[str, int]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT cart_json FROM user_carts WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    if row and row["cart_json"]:
        try:
            return json.loads(row["cart_json"])
        except Exception:
            return {}
    return {}

def save_user_cart(user_id: int, cart: dict[str, int]):
    conn = get_connection()
    c = conn.cursor()
    cart_json = json.dumps(cart, ensure_ascii=False)
    c.execute("""
    INSERT INTO user_carts (user_id, cart_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET cart_json = excluded.cart_json, updated_at = CURRENT_TIMESTAMP
    """, (user_id, cart_json))
    conn.commit()
    conn.close()

def clear_user_cart(user_id: int):
    conn = get_connection()
    c = conn.cursor()
    c.execute("DELETE FROM user_carts WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()

# Order management
def create_order(order_num: int, user_id: int, user_name: str, customer_name: str, customer_phone: str,
                 order_type: str, address: str, payment_method: str, items: dict, total_price: int) -> int:
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO orders (order_num, user_id, user_name, customer_name, customer_phone, order_type, address, payment_method, items_json, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (order_num, user_id, user_name, customer_name, customer_phone, order_type, address, payment_method, json.dumps(items, ensure_ascii=False), total_price))
    order_id = c.lastrowid
    conn.commit()
    conn.close()
    return order_id

def get_recent_orders(limit: int = 5):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Reservation management
def create_reservation(code: int, user_id: int, user_name: str, customer_name: str, customer_phone: str,
                       res_date: str, res_time: str, guests: str, zone: str) -> int:
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO reservations (code, user_id, user_name, customer_name, customer_phone, res_date, res_time, guests, zone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (code, user_id, user_name, customer_name, customer_phone, res_date, res_time, guests, zone))
    res_id = c.lastrowid
    conn.commit()
    conn.close()
    return res_id

def get_recent_reservations(limit: int = 5):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM reservations ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Event & Banquet Inquiries management
def create_event_inquiry(event_id: str, customer_name: str, customer_phone: str,
                         event_type: str, hall: str, guests: str, event_date: str, comment: str) -> int:
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO event_inquiries (event_id, customer_name, customer_phone, event_type, hall, guests, event_date, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (event_id, customer_name, customer_phone, event_type, hall, guests, event_date, comment))
    row_id = c.lastrowid
    conn.commit()
    conn.close()
    return row_id

def get_recent_events(limit: int = 5):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM event_inquiries ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Staff / Admin management
def register_staff(user_id: int, user_name: str, full_name: str, role: str = "admin") -> bool:
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO staff (user_id, user_name, full_name, role)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET user_name = excluded.user_name, full_name = excluded.full_name, role = excluded.role
    """, (user_id, user_name, full_name, role))
    conn.commit()
    conn.close()
    return True

def update_order_status(order_num: int | str, status: str) -> bool:
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE orders SET status = ? WHERE order_num = ? OR id = ?", (status, order_num, order_num))
    affected = c.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def get_order(order_num: int | str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders WHERE order_num = ? OR id = ?", (order_num, order_num))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_staff_ids() -> list[int]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT user_id FROM staff")
    rows = c.fetchall()
    conn.close()
    return [r["user_id"] for r in rows]

def is_staff(user_id: int) -> bool:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT 1 FROM staff WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return bool(row)

def is_courier(user_id: int) -> bool:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT role FROM staff WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return False
    role = (row["role"] or "").lower()
    return role in ("courier", "курьер", "admin", "диспетчер", "менеджер")

# App settings & courier group channel
def get_setting(key: str, default: str = None) -> str:
    conn = get_connection()
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    c.execute("SELECT value FROM app_settings WHERE key = ?", (key,))
    row = c.fetchone()
    conn.close()
    if row and row["value"]:
        return row["value"]
    return default

def set_setting(key: str, value: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    c.execute("""
    INSERT INTO app_settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    """, (key, str(value)))
    conn.commit()
    conn.close()

def claim_order(order_num: int | str, courier_id: int | str, courier_name: str) -> tuple[bool, str]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT courier_name, status FROM orders WHERE order_num = ? OR id = ?", (order_num, order_num))
    row = c.fetchone()
    if not row:
        conn.close()
        return False, "Заказ не найден в базе данных"
    if row["courier_name"] and row["status"] in ("в пути", "выполнен"):
        conn.close()
        return False, f"Заказ уже взят курьером {row['courier_name']}"
    c.execute("""
    UPDATE orders 
    SET courier_id = ?, courier_name = ?, status = 'в пути'
    WHERE order_num = ? OR id = ?
    """, (str(courier_id), courier_name, order_num, order_num))
    conn.commit()
    conn.close()
    return True, "Успешно"

def complete_order_delivery(order_num: int | str, user_id: int | str, user_name: str) -> tuple[bool, str]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT courier_id, courier_name, status FROM orders WHERE order_num = ? OR id = ?", (order_num, order_num))
    row = c.fetchone()
    if not row:
        conn.close()
        return False, "Заказ не найден в базе данных"
    c.execute("UPDATE orders SET status = 'выполнен' WHERE order_num = ? OR id = ?", (order_num, order_num))
    conn.commit()
    conn.close()
    return True, "Успешно"

def get_courier_active_orders(courier_id: int | str) -> list[dict]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT * FROM orders 
    WHERE (courier_id = ? OR courier_name LIKE ?) AND status = 'в пути'
    ORDER BY id DESC
    """, (str(courier_id), f"%{courier_id}%"))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_courier_stats(courier_id: int | str) -> dict:
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT COUNT(*), COALESCE(SUM(total_price), 0) FROM orders 
    WHERE (courier_id = ? OR courier_name LIKE ?) AND status = 'выполнен'
    """, (str(courier_id), f"%{courier_id}%"))
    total_count, total_sum = c.fetchone()
    today_str = datetime.now().strftime("%Y-%m-%d")
    c.execute("""
    SELECT COUNT(*), COALESCE(SUM(total_price), 0) FROM orders 
    WHERE (courier_id = ? OR courier_name LIKE ?) AND status = 'выполнен' AND created_at >= ?
    """, (str(courier_id), f"%{courier_id}%", today_str))
    today_count, today_sum = c.fetchone()
    conn.close()
    return {
        "total_count": total_count or 0,
        "total_sum": total_sum or 0,
        "today_count": today_count or 0,
        "today_sum": today_sum or 0
    }

def get_unclaimed_delivery_orders(limit: int = 5) -> list[dict]:
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    SELECT * FROM orders 
    WHERE (courier_name IS NULL OR courier_name = '')
      AND status IN ('новый', 'кухня готовит', 'в пути')
    ORDER BY id DESC LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# User language settings
def get_user_language(user_id: int) -> str:
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT language FROM user_settings WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    if row and row["language"]:
        return row["language"]
    return "ru"

def set_user_language(user_id: int, lang: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
    INSERT INTO user_settings (user_id, language, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, updated_at = CURRENT_TIMESTAMP
    """, (user_id, lang))
    conn.commit()
    conn.close()

# Stats
def get_stats():
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*), COALESCE(SUM(total_price), 0) FROM orders")
    total_orders, total_revenue = c.fetchone()
    c.execute("SELECT COUNT(*) FROM reservations")
    total_res = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM event_inquiries")
    total_events = c.fetchone()[0]
    conn.close()
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_reservations": total_res,
        "total_events": total_events
    }

def get_stoplist():
    conn = get_connection()
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS menu_stoplist (name TEXT PRIMARY KEY, stopped INTEGER, updated_at TEXT)")
    rows = c.execute("SELECT name FROM menu_stoplist WHERE stopped = 1").fetchall()
    conn.close()
    return set(r["name"] for r in rows)

# Initialize on import
init_db()
