from datetime import datetime, timezone, timedelta
from aiogram.types import CallbackQuery, InlineKeyboardMarkup
import db
from config import ADMIN_IDS

# Tashkent timezone is UTC+5
TASHKENT_TZ = timezone(timedelta(hours=5))

def get_tashkent_now() -> datetime:
    return datetime.now(TASHKENT_TZ)

def is_restaurant_open() -> tuple[bool, str]:
    now = get_tashkent_now()
    # Opening hours: 11:00 to 23:00
    current_hour = now.hour
    is_open = 11 <= current_hour < 23
    time_str = now.strftime("%H:%M")
    return is_open, time_str

async def safe_edit_or_send(callback: CallbackQuery, text: str, reply_markup: InlineKeyboardMarkup | None = None):
    msg = callback.message
    try:
        # If the message contains a photo, edit_text fails. We delete it and send a clean text message.
        if msg.photo:
            await msg.delete()
            await msg.answer(text, parse_mode="HTML", reply_markup=reply_markup)
        else:
            await msg.edit_text(text, parse_mode="HTML", reply_markup=reply_markup)
    except Exception:
        try:
            await msg.answer(text, parse_mode="HTML", reply_markup=reply_markup)
        except Exception:
            pass

async def notify_all_admins(bot, text: str):
    staff_ids = set(db.get_all_staff_ids()) | set(ADMIN_IDS)
    for uid in staff_ids:
        try:
            await bot.send_message(chat_id=uid, text=text, parse_mode="HTML")
        except Exception:
            pass
