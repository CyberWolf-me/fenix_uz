CREATE TABLE orders (
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

CREATE TABLE sqlite_sequence(name,seq);

CREATE TABLE reservations (
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

CREATE TABLE staff (
        user_id INTEGER PRIMARY KEY,
        user_name TEXT,
        full_name TEXT,
        role TEXT DEFAULT 'admin',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE user_carts (
        user_id INTEGER PRIMARY KEY,
        cart_json TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE user_settings (
        user_id INTEGER PRIMARY KEY,
        language TEXT DEFAULT 'ru',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE event_inquiries (
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

CREATE TABLE menu_stoplist (name TEXT PRIMARY KEY, stopped INTEGER, updated_at TEXT);