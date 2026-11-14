import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Safe .env loader (with or without python-dotenv)
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
    load_dotenv(BASE_DIR.parent / ".env")
except ImportError:
    for env_file in (BASE_DIR / ".env", BASE_DIR.parent / ".env"):
        if env_file.exists():
            try:
                for line in open(env_file, "r", encoding="utf-8"):
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
            except Exception:
                pass

# Bot Token provided by user (Customer Bot)
BOT_TOKEN = os.getenv("BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN") or ""
BOT_USERNAME = os.getenv("BOT_USERNAME", "FenixRestaurantBot")

# Dedicated Courier Bot Token (Option 2 + Option 3 Logistics Bot)
COURIER_BOT_TOKEN = os.getenv("COURIER_BOT_TOKEN") or ""
COURIER_BOT_USERNAME = os.getenv("COURIER_BOT_USERNAME", "FenixRestaurantCourierBot")

# Optional: Admin Chat IDs (comma-separated if multiple)
ADMIN_IDS = [int(x.strip()) for x in os.getenv("ADMIN_CHAT_ID", "").split(",") if x.strip().isdigit()]
BOT_ADMIN_PASSWORD = os.getenv("BOT_ADMIN_PASSWORD", "fenix_admin_2026")
BOT_COURIER_PASSWORD = os.getenv("BOT_COURIER_PASSWORD", "fenix_courier_2026")

# Official Website URL (configurable, for local dev: http://localhost:3000 or production domain)
WEBSITE_URL = os.getenv("WEBSITE_URL", "https://fenix.mosaiclabs.tech")
WEBAPP_URL = os.getenv("WEBAPP_URL", f"{WEBSITE_URL}/app.html")

# Paths to assets
LOGO_AVATAR = BASE_DIR / "img" / "bot_avatar.png"
MENU_PDF_LIGHT = BASE_DIR / "Fenix_Menu_Light.pdf"
MENU_PAGES_DIR = BASE_DIR / "menu_pages"
IMG_DIR = BASE_DIR / "img"
