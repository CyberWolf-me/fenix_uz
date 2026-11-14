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

from config import BOT_TOKEN, COURIER_BOT_TOKEN, WEBAPP_URL
from handlers import start, menu, cart, reservation, contacts, search
import courier_bot

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("fenix_dual_runner")

async def run_customer_bot():
    if not BOT_TOKEN:
        logger.warning("BOT_TOKEN is not configured for Customer Bot.")
        return
    session = AiohttpSession(timeout=35)
    bot = Bot(token=BOT_TOKEN, session=session, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(start.router)
    dp.include_router(menu.router)
    dp.include_router(cart.router)
    dp.include_router(reservation.router)
    dp.include_router(contacts.router)
    dp.include_router(search.router)

    try:
        await bot.delete_webhook(drop_pending_updates=True)
        me = await bot.get_me()
        logger.info(f"Customer Bot @{me.username} connected!")
        if WEBAPP_URL and WEBAPP_URL.startswith("https://"):
            try:
                await bot.set_chat_menu_button(
                    menu_button=MenuButtonWebApp(text="Заказ & Бронь", web_app=WebAppInfo(url=WEBAPP_URL))
                )
            except Exception:
                pass
        await dp.start_polling(bot, polling_timeout=25)
    except Exception as e:
        logger.error(f"Customer Bot error: {e}")
    finally:
        await bot.session.close()

async def run_courier_bot():
    if not COURIER_BOT_TOKEN:
        logger.warning("COURIER_BOT_TOKEN is not configured for Courier Bot.")
        return
    session = AiohttpSession(timeout=35)
    bot = Bot(token=COURIER_BOT_TOKEN, session=session, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(courier_bot.router)

    try:
        await bot.delete_webhook(drop_pending_updates=True)
        me = await bot.get_me()
        logger.info(f"Courier Bot @{me.username} connected!")
        await dp.start_polling(bot, polling_timeout=25)
    except Exception as e:
        logger.error(f"Courier Bot error: {e}")
    finally:
        await bot.session.close()

async def main():
    print("=" * 60)
    print("  FENIX RESTAURANT DUAL BOT SYSTEM IS STARTING...")
    print("  1. Customer Bot: @FenixRestaurantBot")
    print("  2. Courier Bot:  @FenixRestaurantCourierBot")
    print("=" * 60)
    await asyncio.gather(
        run_customer_bot(),
        run_courier_bot()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Bots execution terminated.")
