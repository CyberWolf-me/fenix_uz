import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
# Load .env from bot directory or project root
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

# Bot Token provided by user
BOT_TOKEN = os.getenv("BOT_TOKEN", "8672936517:AAE47svUKGoNamhC2KSBNfxu1zd_R5s-8lI")
BOT_USERNAME = os.getenv("BOT_USERNAME", "FenixRestaurantBot")

# Optional: Admin Chat IDs (comma-separated if multiple)
ADMIN_IDS = [int(x.strip()) for x in os.getenv("ADMIN_CHAT_ID", "").split(",") if x.strip().isdigit()]

# Official Website URL (configurable, for local dev: http://localhost:3000 or production domain)
WEBSITE_URL = os.getenv("WEBSITE_URL", "https://b714-213-230-78-186.ngrok-free.app")
WEBAPP_URL = os.getenv("WEBAPP_URL", f"{WEBSITE_URL}/app.html")

# Paths to assets
LOGO_AVATAR = BASE_DIR / "img" / "bot_avatar.png"
MENU_PDF_LIGHT = BASE_DIR / "Fenix_Menu_Light.pdf"
MENU_PAGES_DIR = BASE_DIR / "menu_pages"
IMG_DIR = BASE_DIR / "img"
