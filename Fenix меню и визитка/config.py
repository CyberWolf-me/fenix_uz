import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Bot Token provided by user
BOT_TOKEN = os.getenv("BOT_TOKEN", "9206368189:AAFIZu2qqtl5JbEEEcXXGbny-8i4zkbu5Hk")
BOT_USERNAME = os.getenv("BOT_USERNAME", "Fenix_restaurant_bot")

# Optional: Admin Chat IDs (comma-separated if multiple)
ADMIN_IDS = [int(x.strip()) for x in os.getenv("ADMIN_CHAT_ID", "").split(",") if x.strip().isdigit()]

# Official Website URL (configurable, for local dev: http://localhost:3000 or production domain)
WEBSITE_URL = os.getenv("WEBSITE_URL", "http://localhost:3000")

# Paths to assets
LOGO_AVATAR = BASE_DIR / "img" / "bot_avatar.png"
MENU_PDF_LIGHT = BASE_DIR / "Fenix_Menu_Light.pdf"
MENU_PAGES_DIR = BASE_DIR / "menu_pages"
IMG_DIR = BASE_DIR / "img"
