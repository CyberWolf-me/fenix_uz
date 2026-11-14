import asyncio
import logging
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode
from aiogram.types import MenuButtonWebApp, WebAppInfo

from config import BOT_TOKEN, WEBAPP_URL
from handlers import start, menu, cart, reservation, contacts, search, profile

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("fenix_bot")

async def main():
    if not BOT_TOKEN:
        logger.error("BOT_TOKEN is not configured! Please provide a valid token.")
        return

    logger.info("Initializing FENIX Restaurant Bot...")
    # Use standard ProactorEventLoop on Windows (0% idle CPU)
    session = AiohttpSession(timeout=35)
    bot = Bot(
        token=BOT_TOKEN,
        session=session,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    storage = MemoryStorage()
    dp = Dispatcher(storage=storage)

    # Register handlers
    dp.include_router(start.router)
    dp.include_router(menu.router)
    dp.include_router(cart.router)
    dp.include_router(reservation.router)
    dp.include_router(profile.router)
    dp.include_router(contacts.router)
    dp.include_router(search.router)

    # Drop any pending updates so old messages don't spam
    try:
        await bot.delete_webhook(drop_pending_updates=True)
        me = await bot.get_me()
        logger.info(f"Bot @{me.username} (ID: {me.id}) connected successfully!")

        if WEBAPP_URL and WEBAPP_URL.startswith("https://"):
            try:
                await bot.set_chat_menu_button(
                    menu_button=MenuButtonWebApp(text="Заказ & Бронь", web_app=WebAppInfo(url=WEBAPP_URL))
                )
                logger.info(f"Telegram WebApp Menu Button configured: {WEBAPP_URL}")
            except Exception as e:
                logger.warning(f"Could not set chat menu button: {e}")
        print("\n" + "=" * 55)
        print(f" [FENIX RESTAURANT & BAR] BOT IS ONLINE!")
        print(f" Bot username: @{me.username}")
        print(f" Link: https://t.me/{me.username}")
        print("=" * 55 + "\n")
    except Exception as e:
        logger.error(f"Error connecting to Telegram API: {e}")
        return

    try:
        logger.info("Starting polling updates (idle mode, low CPU)...")
        await dp.start_polling(bot, polling_timeout=25)
    finally:
        await bot.session.close()
        logger.info("Bot polling stopped.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bot execution terminated.")
