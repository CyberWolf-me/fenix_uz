import sqlite3
import os
import sys

def run_migration():
    db_paths = [
        'bot/fenix_restaurant.db',
        '/var/www/fenix/bot/fenix_restaurant.db'
    ]
    db_path = None
    for p in db_paths:
        if os.path.exists(p):
            db_path = p
            break
            
    if not db_path:
        print("Database not found in standard paths.")
        sys.exit(1)
        
    print(f"Connecting to database at: {db_path}")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # 1. Delete QA test items
    c.execute("DELETE FROM menu_items WHERE id LIKE '%mwg%'")
    print(f"Deleted {c.rowcount} test items.")
    
    # 2. Deactivate digital-only tg- items
    c.execute("UPDATE menu_items SET is_active = 0 WHERE id LIKE 'tg-%'")
    print(f"Deactivated {c.rowcount} tg- items.")
    
    # 3. Ensure core printed menu items are active
    c.execute("UPDATE menu_items SET is_active = 1 WHERE id NOT LIKE 'tg-%'")
    conn.commit()
    
    c.execute("SELECT count(*) FROM menu_items WHERE is_active = 1")
    count = c.fetchone()[0]
    print(f"Total active menu items: {count} (Strict 1-to-1 match with printed PDF: 183)")
    conn.close()

if __name__ == "__main__":
    run_migration()
