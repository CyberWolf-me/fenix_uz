import os
import sys
import time
import json
import sqlite3
import hmac
import hashlib
import urllib.parse
import urllib.request
import subprocess

SERVER_PORT = 3005
BASE_URL = f"http://127.0.0.1:{SERVER_PORT}"
BOT_TOKEN = "test_bot_token_12345"
ADMIN_PASSWORD = "test_admin_pwd"

def http_req(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            res_body = response.read().decode("utf-8")
            try:
                res_json = json.loads(res_body)
            except Exception:
                res_json = res_body
            return status, res_json
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            err_json = json.loads(err_body)
        except Exception:
            err_json = err_body
        return e.code, err_json

def generate_valid_init_data(bot_token, user_dict):
    user_str = json.dumps(user_dict, separators=(',', ':'))
    auth_date = str(int(time.time()))
    data = {
        "auth_date": auth_date,
        "query_id": "AAHdF6IQAAAAAN0XohD12345",
        "user": user_str
    }
    sorted_pairs = [f"{k}={v}" for k, v in sorted(data.items())]
    data_check_string = "\n".join(sorted_pairs)
    secret_key = hmac.new(b"WebAppData", bot_token.encode("utf-8"), hashlib.sha256).digest()
    sig = hmac.new(secret_key, data_check_string.encode("utf-8"), hashlib.sha256).hexdigest()
    
    encoded_pairs = [f"{k}={urllib.parse.quote(v)}" for k, v in data.items()]
    encoded_pairs.append(f"hash={sig}")
    return "&".join(encoded_pairs)

def run_tests():
    print("--- Starting Post-Launch Hardening Verification Suite ---")
    
    # 1. Start local node server on port 3005
    env = os.environ.copy()
    env["PORT"] = str(SERVER_PORT)
    env["TELEGRAM_BOT_TOKEN"] = BOT_TOKEN
    env["ADMIN_PASSWORD"] = ADMIN_PASSWORD
    
    server_process = subprocess.Popen(
        ["node", "fenix-restobar-website/server/server.mjs"],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    try:
        # Wait for server to start
        time.sleep(2.5)
        
        # Test server reachable
        try:
            status, res = http_req(f"{BASE_URL}/api/status")
            print(f"Server status check: {status}, data: {res}")
            assert status == 200
        except Exception as e:
            print(f"Server failed to start: {e}")
            sys.exit(1)
            
        # Get a real dish from SQLite
        db_path = os.path.join(os.getcwd(), "bot", "fenix_restaurant.db")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT id, name, price FROM menu_items WHERE is_active = 1 LIMIT 1")
        row = cur.fetchone()
        conn.close()
        
        if not row:
            print("Error: No menu items found in DB")
            sys.exit(1)
            
        dish_id, dish_name, real_price = row[0], row[1], row[2]
        print(f"Sample DB item: id={dish_id}, name={dish_name}, authoritative_price={real_price}")
        
        # TEST 1: Tampered item price and total submitted by customer
        print("\n--- TEST 1: Price Tampering Prevention ---")
        tampered_order = {
            "name": "Security Tester",
            "customerName": "Security Tester",
            "phone": "+998901112233",
            "type": "delivery",
            "address": "Test street 1",
            "delivery_address": "Test street 1",
            "items": [
                {
                    "id": dish_id,
                    "name": dish_name,
                    "price": 1,        # Tampered price!
                    "quantity": 2
                }
            ],
            "total": 1                 # Tampered total!
        }
        
        status, order_res = http_req(f"{BASE_URL}/api/orders", method="POST", data=tampered_order)
        assert status == 200, f"Expected 200, got {status}: {order_res}"
        print(f"Tampered order response: success={order_res.get('success')}, total={order_res.get('total')}")
        
        # Expected total: 2 * real_price + deliveryFee (20000 if items < 250000 else 0)
        expected_items_total = 2 * real_price
        expected_delivery = 0 if expected_items_total >= 250000 else 20000
        expected_total = expected_items_total + expected_delivery
        
        assert order_res.get("total") == expected_total, f"Expected total {expected_total}, but got {order_res.get('total')}"
        print(f"PASS: Server rejected tampered price 1 UZS and recalculated authoritative total {expected_total} UZS")
        
        # Check SQLite to verify database stored the authoritative total
        order_num = order_res.get("orderNum")
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT total_price FROM orders WHERE order_num = ?", (order_num,))
        stored_total = cur.fetchone()[0]
        conn.close()
        assert stored_total == expected_total, f"DB stored total {stored_total} != expected {expected_total}"
        print(f"PASS: Database orders table stored authoritative total {stored_total} UZS")
        
        # TEST 2: Admin Authorized Override
        print("\n--- TEST 2: Admin Custom Total Override ---")
        admin_order = {
            "name": "VIP Table Admin",
            "customerName": "VIP Table Admin",
            "phone": "+998909998877",
            "type": "dine_in",
            "items": [
                {
                    "id": dish_id,
                    "name": dish_name,
                    "price": real_price,
                    "quantity": 1
                }
            ],
            "total": 50000             # Admin manual discount/override
        }
        status, admin_order_res = http_req(
            f"{BASE_URL}/api/orders",
            method="POST",
            data=admin_order,
            headers={"Authorization": f"Bearer {ADMIN_PASSWORD}"}
        )
        assert status == 200, f"Expected 200, got {status}: {admin_order_res}"
        assert admin_order_res.get("total") == 50000, f"Expected admin total 50000, got {admin_order_res.get('total')}"
        print("PASS: Admin authorized manual override (50000 UZS) was respected")
        
        # TEST 3: Telegram initData HMAC Verification on /api/profile
        print("\n--- TEST 3: Telegram initData Signature Verification ---")
        # 3a. Invalid signature header on GET
        status, res_invalid = http_req(
            f"{BASE_URL}/api/profile?user_id=12345",
            headers={"X-Telegram-Init-Data": "auth_date=1700000000&user=%7B%7D&hash=deadbeef"}
        )
        assert status == 401, f"Expected 401 for invalid initData, got {status}"
        print("PASS: Invalid X-Telegram-Init-Data signature correctly rejected with HTTP 401 on GET")
        
        # 3b. Invalid signature header on POST
        status, res_post_invalid = http_req(
            f"{BASE_URL}/api/profile",
            method="POST",
            data={"phone": "+998901234567"},
            headers={"X-Telegram-Init-Data": "tampered_data"}
        )
        assert status == 401, f"Expected 401, got {status}"
        print("PASS: POST /api/profile with tampered signature correctly rejected with HTTP 401")
        
        # 3c. Valid signature on POST to create/update profile
        test_user = {"id": 778899, "first_name": "Aziz", "username": "aziz_fenix"}
        valid_init_data = generate_valid_init_data(BOT_TOKEN, test_user)
        
        status, res_post_valid = http_req(
            f"{BASE_URL}/api/profile",
            method="POST",
            data={"phone": "+998907778899", "name": "Aziz Updated", "address": "Chilanzar 1"},
            headers={"X-Telegram-Init-Data": valid_init_data}
        )
        assert status == 200, f"Expected 200, got {status}: {res_post_valid}"
        saved_profile = res_post_valid.get("profile", {})
        assert saved_profile.get("full_name") == "Aziz Updated"
        assert saved_profile.get("user_id") == 778899
        print(f"PASS: POST /api/profile with valid initData updated profile for user 778899: {saved_profile.get('full_name')}")
        
        # 3d. Valid signature on GET
        status, res_valid = http_req(
            f"{BASE_URL}/api/profile",
            headers={"X-Telegram-Init-Data": valid_init_data}
        )
        assert status == 200, f"Expected 200 for valid initData, got {status}: {res_valid}"
        profile = res_valid.get("profile", {})
        assert profile.get("user_id") == 778899, f"Expected user_id 778899, got {profile.get('user_id')}"
        print(f"PASS: Valid initData authenticated successfully on GET: user_id={profile.get('user_id')}")
        
        # 3e. Spoofed user_id in query parameter ignored
        status, res_spoof = http_req(
            f"{BASE_URL}/api/profile?user_id=111111",
            headers={"X-Telegram-Init-Data": valid_init_data}
        )
        assert status == 200
        spoof_profile = res_spoof.get("profile", {})
        assert spoof_profile.get("user_id") == 778899, f"Spoofed user_id was NOT ignored! Got {spoof_profile.get('user_id')}"
        print("PASS: Spoofed query user_id (111111) safely ignored in favor of verified initData user.id (778899)")
        
        # TEST 4: Live Menu Price Sync
        print("\n--- TEST 4: Live Menu Price Synchronization ---")
        sys.path.insert(0, os.path.join(os.getcwd(), "bot"))
        from menu_data import get_live_menu_catalog
        
        _, items_before = get_live_menu_catalog()
        dish_before = items_before.get(dish_id)
        assert dish_before is not None, f"Dish {dish_id} not found in live catalog"
        initial_price = dish_before["price"]
        print(f"Initial price for {dish_id} in bot catalog: {initial_price}")
        
        new_test_price = initial_price + 5000
        # Update price via Admin API
        status, res_price_update = http_req(
            f"{BASE_URL}/api/admin/menu/price",
            method="POST",
            data={"id": dish_id, "price": new_test_price},
            headers={"Authorization": f"Bearer {ADMIN_PASSWORD}"}
        )
        assert status == 200, f"Failed to update price: {res_price_update}"
        print(f"Admin API updated price for {dish_id} to {new_test_price}")
        
        # Immediately query get_live_menu_catalog without restarting
        _, items_after = get_live_menu_catalog()
        dish_after = items_after.get(dish_id)
        assert dish_after["price"] == new_test_price, f"Bot live catalog did NOT reflect new price! Got {dish_after['price']}, expected {new_test_price}"
        print(f"PASS: get_live_menu_catalog() immediately returned updated price: {dish_after['price']} UZS")
        
        # Restore initial price
        http_req(
            f"{BASE_URL}/api/admin/menu/price",
            method="POST",
            data={"id": dish_id, "price": initial_price},
            headers={"Authorization": f"Bearer {ADMIN_PASSWORD}"}
        )
        _, items_restored = get_live_menu_catalog()
        dish_restored = items_restored.get(dish_id)
        assert dish_restored["price"] == initial_price
        print(f"Restored price back to original {initial_price} UZS")
        
        print("\nALL BACKEND HARDENING TESTS PASSED SUCCESSFULLY!")
        
    finally:
        server_process.terminate()
        server_process.wait()
        print("Server process shut down.")

if __name__ == "__main__":
    run_tests()
