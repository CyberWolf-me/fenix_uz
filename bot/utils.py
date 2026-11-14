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

async def notify_courier_group_new_order(order_num: int, customer_name: str, phone: str, address: str, items: dict, total_price: int, pay_method: str = "Наличными"):
    courier_group_id = db.get_setting("courier_group_id")
    if not courier_group_id:
        return
    from config import COURIER_BOT_TOKEN
    if not COURIER_BOT_TOKEN:
        return
    from aiogram import Bot
    from aiogram.client.default import DefaultBotProperties
    from aiogram.enums import ParseMode
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    from menu_data import format_price
    import re

    m = re.search(r"(\d{2}\.\d+)[,\s]+(\d{2}\.\d+)", address or "")
    if m:
        lat, lon = float(m.group(1)), float(m.group(2))
    else:
        lat, lon = 41.3111, 69.2797

    yandex_route = f"https://yandex.uz/maps/?rtext=41.2858,69.3402~{lat},{lon}&rtt=auto"
    yandex_navi = f"yandexnavi://build_route_on_map?lat_to={lat}&lon_to={lon}"

    items_list = []
    if isinstance(items, dict):
        for name, val in items.items():
            qty = val.get("qty", 1) if isinstance(val, dict) else val
            items_list.append(f"• <b>{name}</b> × {qty}")
    elif isinstance(items, list):
        for it in items:
            name = it.get("name", "Блюдо") if isinstance(it, dict) else str(it)
            qty = it.get("qty", 1) if isinstance(it, dict) else 1
            items_list.append(f"• <b>{name}</b> × {qty}")

    card = [
        "🛵 <b>НОВЫЙ ЗАКАЗ НА ДОСТАВКУ (ОЖИДАЕТ КУРЬЕРА)</b>",
        "━━━━━━━━━━━━━━━━━━━━",
        f"📦 <b>Заказ #WEB-{order_num}</b>",
        "🏢 <b>Откуда забрать:</b> FENIX Hub (Яшнабад, 5-й проезд, 1а)",
        f"📍 <b>Куда доставить:</b> <code>{address}</code>",
        f"🧭 <b>Координаты:</b> <code>{lat:.4f}, {lon:.4f}</code>",
        "",
        f"👤 <b>Клиент:</b> {customer_name}",
        f"📞 <b>Телефон:</b> <a href=\"tel:{phone}\">{phone}</a>",
        "",
        "📋 <b>Состав заказа:</b>",
        "\n".join(items_list) if items_list else "• Заказ по меню",
        "",
        f"💰 <b>К получению с клиента:</b> <b>{format_price(total_price)}</b> ({pay_method})",
        "━━━━━━━━━━━━━━━━━━━━",
        "📲 <i>Нажмите для построения маршрута в Навигаторе:</i>",
        f"<code>{yandex_navi}</code>"
    ]

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🧭 Маршрут в Яндекс Картах", url=yandex_route)],
        [InlineKeyboardButton(text="🙋‍♂️ Взять заказ на доставку", callback_data=f"courier_claim:{order_num}")]
    ])

    try:
        async with Bot(token=COURIER_BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML)) as c_bot:
            await c_bot.send_message(chat_id=int(courier_group_id), text="\n".join(card), reply_markup=kb)
    except Exception:
        pass
