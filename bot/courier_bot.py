import asyncio
import logging
import sys
import re
from datetime import datetime
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from aiogram import Bot, Dispatcher, Router, F
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession
from aiogram.enums import ParseMode
from aiogram.types import (
    Message, CallbackQuery, ReplyKeyboardMarkup, KeyboardButton,
    InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardRemove
)
from aiogram.filters import CommandStart, Command

from config import COURIER_BOT_TOKEN, COURIER_BOT_USERNAME, WEBSITE_URL, BOT_TOKEN
import db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("fenix_courier_bot")

router = Router()

async def notify_customer_direct(chat_id: int | str, text: str):
    """Direct status push notification to guest/customer via Customer Bot (@FenixRestaurantBot)"""
    try:
        if not BOT_TOKEN:
            return
        async with Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML)) as c_bot:
            await c_bot.send_message(chat_id=int(chat_id), text=text)
    except Exception as e:
        logger.debug(f"Could not push to customer {chat_id}: {e}")

FENIX_HUB_COORDS = (41.2858, 69.3402)
FENIX_HUB_ADDRESS = "г. Ташкент, Яшнабадский район, ул. Хуснабад, 5 проезд, Дом 1а"

# ── Couriers Reply Keyboard (Private Chat) ─────────────────────────────
def courier_main_reply_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [
                KeyboardButton(text="🛵 Мои активные заказы"),
                KeyboardButton(text="📦 Свободные заказы")
            ],
            [
                KeyboardButton(text="📊 Моя статистика"),
                KeyboardButton(text="📍 Маршрут в ресторан FENIX")
            ]
        ],
        resize_keyboard=True
    )

def extract_order_num(text: str) -> int | None:
    if not text:
        return None
    m = re.search(r"#?WEB-(\d+)", text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m = re.search(r"Заказ #?(\d+)", text, re.IGNORECASE)
    if m:
        return int(m.group(1))
    m = re.search(r"\b(\d{4,6})\b", text)
    if m:
        return int(m.group(1))
    return None

def extract_coords(address_or_text: str) -> tuple[float, float]:
    m = re.search(r"(\d{2}\.\d+)[,\s]+(\d{2}\.\d+)", address_or_text or "")
    if m:
        lat = float(m.group(1))
        lon = float(m.group(2))
        if 40 < lat < 43 and 68 < lon < 71:
            return lat, lon
    return 41.3111, 69.2797

# ── 1. Group & Private /start handler ─────────────────────────────────
@router.message(CommandStart())
async def cmd_start(message: Message):
    user = message.from_user
    chat = message.chat

    # If triggered inside a Group / Supergroup: Register Courier Group
    if chat.type in ("group", "supergroup"):
        db.set_setting("courier_group_id", str(chat.id))
        db.set_setting("courier_group_title", chat.title or "Группа курьеров FENIX")
        await message.answer(
            "✅ <b>ГРУППА КУРЬЕРОВ FENIX УСПЕШНО ПОДКЛЮЧЕНА!</b>\n\n"
            f"🏷 <b>Чат:</b> {chat.title}\n"
            f"🆔 <b>Chat ID:</b> <code>{chat.id}</code>\n"
            f"🤖 <b>Бот службы доставки:</b> @{COURIER_BOT_USERNAME}\n\n"
            "📦 <b>Как работает доставка через группу:</b>\n"
            "1. При передаче заказа в доставку в этот чат поступает карточка заказа.\n"
            "2. Водитель нажимает <b>«🙋‍♂️ Взять заказ»</b> (или отвечает <i>«взял»</i>).\n"
            "3. Бот закрепляет заказ за курьером и выдаёт маршрут и кнопку подтверждения.\n"
            "4. После вручения курьер нажимает <b>«✅ Доставлен»</b> (или отвечает <i>«доставил»</i>).",
            parse_mode="HTML"
        )
        return

    # Private Chat with Courier: Authorize & Show Dashboard
    courier_name = user.full_name or user.username or f"ID:{user.id}"
    db.register_staff(user.id, user.username or "", courier_name, role="courier")

    welcome_text = (
        f"👋 Здравствуйте, <b>{courier_name}</b>!\n\n"
        "🛵 Добро пожаловать в рабочую систему доставки <b>FENIX RESTAURANT & BAR</b>.\n\n"
        "Здесь вы можете:\n"
        "• Просматривать свои активные заказы и адрес доставки\n"
        "• Открывать маршрут прямо в <b>Яндекс.Навигаторе</b> и <b>Яндекс.Картах</b>\n"
        "• Подтверждать доставку заказа клиенту в один клик\n"
        "• Отслеживать свою статистику выполненных заказов\n\n"
        "<i>Для получения заказов убедитесь, что вы состоите в рабочей Telegram-группе курьеров Fenix.</i>"
    )
    await message.answer(welcome_text, parse_mode="HTML", reply_markup=courier_main_reply_keyboard())

# ── 2. Command /set_courier_group ──────────────────────────────────────
@router.message(Command("set_courier_group"))
async def cmd_set_courier_group(message: Message):
    chat = message.chat
    if chat.type not in ("group", "supergroup"):
        await message.answer(
            "⚠️ Команду <code>/set_courier_group</code> необходимо отправлять <b>внутри группы курьеров</b> в Telegram.\n\n"
            "1. Создайте группу курьеров (например, <i>«FENIX — Курьеры & Доставка»</i>).\n"
            f"2. Добавьте в неё бота @{COURIER_BOT_USERNAME}.\n"
            "3. Отправьте команду <code>/set_courier_group</code> внутри этой группы.",
            parse_mode="HTML"
        )
        return

    db.set_setting("courier_group_id", str(chat.id))
    db.set_setting("courier_group_title", chat.title or "Группа курьеров FENIX")

    await message.answer(
        "✅ <b>ГРУППА КУРЬЕРОВ ПРИВЯЗАНА К СИСТЕМЕ ДОСТАВКИ FENIX!</b>\n\n"
        f"🏷 <b>Чат:</b> {chat.title}\n"
        f"🆔 <b>Chat ID:</b> <code>{chat.id}</code>\n\n"
        "Все новые заказы на доставку при передаче курьеру (статус <i>«В пути»</i>) "
        "будут публиковаться в этом чате с кнопкой для взятия заказа.",
        parse_mode="HTML"
    )

# ── 3. Inline Claim Callback: courier_claim:{order_num} ────────────────
@router.callback_query(F.data.startswith("courier_claim:"))
async def callback_courier_claim(callback: CallbackQuery, bot: Bot):
    user = callback.from_user
    order_num = callback.data.split(":")[1]
    courier_name = user.full_name or user.username or f"ID:{user.id}"
    username_tag = f"@{user.username}" if user.username else courier_name

    success, reason = db.claim_order(order_num, user.id, courier_name)
    if not success:
        await callback.answer(f"⚠️ {reason}", show_alert=True)
        return

    now_time = datetime.now().strftime("%H:%M")
    await callback.answer(f"✅ Вы взяли заказ #{order_num}! Удачной дороги!", show_alert=False)

    orig_text = callback.message.html_text or callback.message.text or ""
    yandex_url = "https://yandex.uz/maps/?rtext=41.2858,69.3402~41.3119,69.2401&rtt=auto"
    if callback.message.reply_markup and callback.message.reply_markup.inline_keyboard:
        for row in callback.message.reply_markup.inline_keyboard:
            for btn in row:
                if btn.url and "yandex" in btn.url:
                    yandex_url = btn.url
                    break

    updated_text = (
        orig_text +
        f"\n\n━━━━━━━━━━━━━━━━━━━━\n"
        f"🔵 <b>ВЗЯТ КУРЬЕРОМ:</b> {username_tag} ({courier_name})\n"
        f"🕒 <b>Время взятия:</b> <code>{now_time}</code>\n"
        f"🛵 <b>Статус:</b> Заказ в пути к клиенту"
    )

    new_kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🧭 Маршрут в Яндекс Картах", url=yandex_url)],
        [InlineKeyboardButton(text="✅ Заказ доставлен клиенту", callback_data=f"courier_delivered:{order_num}")]
    ])

    try:
        await callback.message.edit_text(updated_text, parse_mode="HTML", reply_markup=new_kb)
    except Exception:
        pass

    # Send personal copy to courier's private chat (if claimed in group)
    ord_data = db.get_order(order_num)
    address = ord_data.get("address", "Ташкент") if ord_data else "Ташкент"
    lat, lon = extract_coords(address)
    yandex_navi = f"yandexnavi://build_route_on_map?lat_to={lat}&lon_to={lon}"

    if callback.message.chat.type in ("group", "supergroup"):
        try:
            if ord_data:
                client_phone = ord_data.get("customer_phone", "")
                pay = "Наличными" if ord_data.get("payment_method") == "cash" else "Картой"
                private_msg = (
                    f"🛵 <b>ВЫ ВЗЯЛИ ЗАКАЗ #WEB-{order_num}</b>\n\n"
                    f"🏢 <b>Забрать:</b> FENIX Hub (Яшнабад, 5-й проезд, 1а)\n"
                    f"📍 <b>Доставить:</b> <code>{address}</code>\n"
                    f"👤 <b>Клиент:</b> {ord_data.get('customer_name', 'Клиент')}\n"
                    f"📞 <b>Телефон:</b> <a href=\"tel:{client_phone}\">{client_phone}</a>\n"
                    f"💰 <b>Сумма к получению:</b> <b>{ord_data.get('total_price', 0):,} сум</b> ({pay})\n\n"
                    f"📲 <i>Навигатор:</i> <code>{yandex_navi}</code>"
                ).replace(",", " ")

                priv_kb = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🧭 Маршрут в Яндекс Картах", url=yandex_url)],
                    [InlineKeyboardButton(text="✅ Заказ доставлен клиенту", callback_data=f"courier_delivered:{order_num}")]
                ])
                await bot.send_message(user.id, private_msg, parse_mode="HTML", reply_markup=priv_kb)
        except Exception as e:
            logger.debug(f"Could not PM courier {user.id}: {e}")
    else:
        # Claimed in private chat: announce to group so other drivers know it's taken
        courier_group_id = db.get_setting("courier_group_id")
        if courier_group_id:
            try:
                await bot.send_message(
                    chat_id=int(courier_group_id),
                    text=(
                        f"🔵 <b>Заказ #WEB-{order_num} взят курьером {username_tag}!</b>\n"
                        f"📍 <b>Адрес:</b> <code>{address}</code>\n"
                        f"🛵 <b>Статус:</b> В пути к клиенту"
                    ),
                    parse_mode="HTML"
                )
            except Exception:
                pass

    # Notify guest/customer via Customer Bot (@FenixRestaurantBot) that courier is en route
    if ord_data and ord_data.get("user_id"):
        cust_uid = str(ord_data.get("user_id")).strip()
        if cust_uid.isdigit() and int(cust_uid) > 1000:
            cust_msg = (
                f"🛵 <b>Ваш заказ #WEB-{order_num} передан курьеру!</b>\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"👤 <b>Курьер:</b> {username_tag}\n"
                f"📍 <b>Адрес доставки:</b> <code>{address}</code>\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"Курьер уже в пути к вам! Пожалуйста, оставайтесь на связи."
            )
            asyncio.create_task(notify_customer_direct(cust_uid, cust_msg))

# ── 4. Inline Delivery Callback: courier_delivered:{order_num} ────────
@router.callback_query(F.data.startswith("courier_delivered:"))
async def callback_courier_delivered(callback: CallbackQuery, bot: Bot):
    user = callback.from_user
    order_num = callback.data.split(":")[1]
    courier_name = user.full_name or user.username or f"ID:{user.id}"
    username_tag = f"@{user.username}" if user.username else courier_name

    success, msg = db.complete_order_delivery(order_num, user.id, courier_name)
    if not success:
        await callback.answer(f"⚠️ {msg}", show_alert=True)
        return

    await callback.answer(f"Заказ #{order_num} успешно доставлен!", show_alert=True)
    now_str = datetime.now().strftime("%d.%m.%Y %H:%M")
    orig_text = callback.message.html_text or callback.message.text or ""

    yandex_url = None
    if callback.message.reply_markup and callback.message.reply_markup.inline_keyboard:
        for row in callback.message.reply_markup.inline_keyboard:
            for btn in row:
                if btn.url and "yandex" in btn.url:
                    yandex_url = btn.url
                    break

    final_text = (
        orig_text +
        f"\n\n━━━━━━━━━━━━━━━━━━━━\n"
        f"🟢 <b>ЗАКАЗ УСПЕШНО ДОСТАВЛЕН КЛИЕНТУ</b>\n"
        f"👤 Доставил: <b>{username_tag}</b>\n"
        f"🕒 Время вручения: <code>{now_str}</code>"
    )

    final_kb = None
    if yandex_url:
        final_kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🧭 Маршрут в Яндекс Картах", url=yandex_url)]
        ])

    try:
        await callback.message.edit_text(final_text, parse_mode="HTML", reply_markup=final_kb)
    except Exception:
        pass

    # If marked in private chat, announce completion to the Courier Group
    if callback.message.chat.type == "private":
        courier_group_id = db.get_setting("courier_group_id")
        if courier_group_id:
            try:
                await bot.send_message(
                    chat_id=int(courier_group_id),
                    text=(
                        f"🟢 <b>ЗАКАЗ #WEB-{order_num} УСПЕШНО ДОСТАВЛЕН!</b>\n"
                        f"👤 Курьер: <b>{username_tag}</b>\n"
                        f"🕒 Время: <code>{now_str}</code>"
                    ),
                    parse_mode="HTML"
                )
            except Exception:
                pass

    # Notify guest/customer via Customer Bot (@FenixRestaurantBot) that order was successfully delivered
    ord_data = db.get_order(order_num)
    if ord_data and ord_data.get("user_id"):
        cust_uid = str(ord_data.get("user_id")).strip()
        if cust_uid.isdigit() and int(cust_uid) > 1000:
            cust_msg = (
                f"🎉 <b>Ваш заказ #WEB-{order_num} успешно доставлен!</b>\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"👤 Доставил курьер: <b>{username_tag}</b>\n"
                f"🕒 Время вручения: <code>{now_str}</code>\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"Благодарим за заказ в FENIX Restobar! Желаем вам приятного аппетита!"
            )
            asyncio.create_task(notify_customer_direct(cust_uid, cust_msg))

# ── 5. Couriers Replying in Group Chat ("взял", "доставил") ────────────
@router.message(F.chat.type.in_({"group", "supergroup"}), F.reply_to_message)
async def handle_group_reply(message: Message, bot: Bot):
    text = (message.text or "").strip().lower()
    replied_text = message.reply_to_message.text or message.reply_to_message.html_text or ""
    order_num = extract_order_num(replied_text)
    if not order_num:
        return

    user = message.from_user
    courier_name = user.full_name or user.username or f"ID:{user.id}"
    username_tag = f"@{user.username}" if user.username else courier_name

    # Claim keywords
    if any(k in text for k in ("взял", "беру", "забираю", "мой", "claim", "мен олдим", "заберу")):
        success, reason = db.claim_order(order_num, user.id, courier_name)
        if success:
            now_time = datetime.now().strftime("%H:%M")
            await message.reply(
                f"✅ <b>Заказ #{order_num} закреплен за {username_tag}!</b>\nУдачной дороги!",
                parse_mode="HTML"
            )
            # Update the original group message
            orig = message.reply_to_message.html_text or message.reply_to_message.text or ""
            lat, lon = extract_coords(orig)
            yandex_url = f"https://yandex.uz/maps/?rtext=41.2858,69.3402~{lat},{lon}&rtt=auto"
            updated = (
                orig +
                f"\n\n━━━━━━━━━━━━━━━━━━━━\n"
                f"🔵 <b>ВЗЯТ КУРЬЕРОМ:</b> {username_tag} ({courier_name})\n"
                f"🕒 <b>Время взятия:</b> <code>{now_time}</code>\n"
                f"🛵 <b>Статус:</b> Заказ в пути к клиенту"
            )
            kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🧭 Маршрут в Яндекс Картах", url=yandex_url)],
                [InlineKeyboardButton(text="✅ Заказ доставлен клиенту", callback_data=f"courier_delivered:{order_num}")]
            ])
            try:
                await bot.edit_message_text(
                    chat_id=message.chat.id,
                    message_id=message.reply_to_message.message_id,
                    text=updated,
                    parse_mode="HTML",
                    reply_markup=kb
                )
            except Exception:
                pass

            # Also send courier app card to courier's private chat
            try:
                ord_data = db.get_order(order_num)
                if ord_data:
                    client_phone = ord_data.get("customer_phone", "")
                    address = ord_data.get("address", "Ташкент")
                    pay = "Наличными" if ord_data.get("payment_method") == "cash" else "Картой"
                    yandex_navi = f"yandexnavi://build_route_on_map?lat_to={lat}&lon_to={lon}"

                    priv_msg = (
                        f"🛵 <b>ВЫ ВЗЯЛИ ЗАКАЗ #WEB-{order_num}</b>\n\n"
                        f"🏢 <b>Забрать:</b> FENIX Hub (Яшнабад, 5-й проезд, 1а)\n"
                        f"📍 <b>Доставить:</b> <code>{address}</code>\n"
                        f"👤 <b>Клиент:</b> {ord_data.get('customer_name', 'Клиент')}\n"
                        f"📞 <b>Телефон:</b> <a href=\"tel:{client_phone}\">{client_phone}</a>\n"
                        f"💰 <b>Сумма к получению:</b> <b>{ord_data.get('total_price', 0):,} сум</b> ({pay})\n\n"
                        f"📲 <i>Навигатор:</i> <code>{yandex_navi}</code>"
                    ).replace(",", " ")

                    priv_kb = InlineKeyboardMarkup(inline_keyboard=[
                        [InlineKeyboardButton(text="🧭 Маршрут в Яндекс Картах", url=yandex_url)],
                        [InlineKeyboardButton(text="✅ Заказ доставлен клиенту", callback_data=f"courier_delivered:{order_num}")]
                    ])
                    await bot.send_message(user.id, priv_msg, parse_mode="HTML", reply_markup=priv_kb)
            except Exception as e:
                logger.debug(f"Could not PM courier {user.id}: {e}")
        else:
            await message.reply(f"⚠️ {reason}")

    # Delivery completion keywords
    elif any(k in text for k in ("доставил", "сдал", "отдал", "готово", "delivered", "топширдим", "доставлен", "закрыл")):
        success, msg = db.complete_order_delivery(order_num, user.id, courier_name)
        if success:
            now_str = datetime.now().strftime("%d.%m.%Y %H:%M")
            await message.reply(
                f"🟢 <b>Заказ #{order_num} успешно отмечен как доставленный!</b> Отличная работа, {username_tag}!",
                parse_mode="HTML"
            )
            orig = message.reply_to_message.html_text or message.reply_to_message.text or ""
            lat, lon = extract_coords(orig)
            yandex_url = f"https://yandex.uz/maps/?rtext=41.2858,69.3402~{lat},{lon}&rtt=auto"
            final_text = (
                orig +
                f"\n\n━━━━━━━━━━━━━━━━━━━━\n"
                f"🟢 <b>ЗАКАЗ УСПЕШНО ДОСТАВЛЕН КЛИЕНТУ</b>\n"
                f"👤 Доставил: <b>{username_tag}</b>\n"
                f"🕒 Время вручения: <code>{now_str}</code>"
            )
            final_kb = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🧭 Маршрут в Яндекс Картах", url=yandex_url)]
            ])
            try:
                await bot.edit_message_text(
                    chat_id=message.chat.id,
                    message_id=message.reply_to_message.message_id,
                    text=final_text,
                    parse_mode="HTML",
                    reply_markup=final_kb
                )
            except Exception:
                pass
        else:
            await message.reply(f"⚠️ {msg}")

# ── 6. Courier Private Dashboard Features ──────────────────────────────
@router.message(F.text == "🛵 Мои активные заказы")
@router.message(Command("my_orders"))
async def cmd_my_orders(message: Message):
    user_id = message.from_user.id
    orders = db.get_courier_active_orders(user_id)

    if not orders:
        await message.answer(
            "🛵 <b>У вас нет активных заказов в доставке.</b>\n\n"
            "Новые заказы поступают в рабочую группу курьеров FENIX, "
            "или вы можете проверить раздел <b>«📦 Свободные заказы»</b>.",
            parse_mode="HTML"
        )
        return

    await message.answer(f"📦 <b>Ваши активные заказы в доставке ({len(orders)}):</b>", parse_mode="HTML")
    for o in orders:
        num = o.get("order_num", o.get("id"))
        client = o.get("customer_name", "Клиент")
        phone = o.get("customer_phone", "")
        addr = o.get("address", "Ташкент")
        total = o.get("total_price", 0)
        pay = "Наличными" if o.get("payment_method") == "cash" else "Картой"
        lat, lon = extract_coords(addr)
        yandex_url = f"https://yandex.uz/maps/?rtext=41.2858,69.3402~{lat},{lon}&rtt=auto"

        card = (
            f"▫️ <b>Заказ #WEB-{num}</b>\n"
            f"👤 <b>Клиент:</b> {client}\n"
            f"📞 <b>Телефон:</b> <a href=\"tel:{phone}\">{phone}</a>\n"
            f"📍 <b>Адрес:</b> <code>{addr}</code>\n"
            f"💰 <b>Сумма:</b> <b>{total:,} сум</b> ({pay})\n"
            f"🛵 <b>Статус:</b> В пути"
        ).replace(",", " ")

        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🧭 Маршрут в Яндекс Картах", url=yandex_url)],
            [InlineKeyboardButton(text="✅ Заказ доставлен клиенту", callback_data=f"courier_delivered:{num}")]
        ])
        await message.answer(card, parse_mode="HTML", reply_markup=kb)

@router.message(F.text == "📦 Свободные заказы")
@router.message(Command("available"))
async def cmd_available_orders(message: Message):
    unclaimed = db.get_unclaimed_delivery_orders(5)
    if not unclaimed:
        await message.answer(
            "✅ <b>Все заказы уже разобраны!</b>\n\n"
            "Свободных заказов на кухне сейчас нет. Ожидайте новых заказов в группе курьеров.",
            parse_mode="HTML"
        )
        return

    await message.answer(f"📦 <b>Свободные заказы, ожидающие курьера ({len(unclaimed)}):</b>", parse_mode="HTML")
    for o in unclaimed:
        num = o.get("order_num", o.get("id"))
        addr = o.get("address", "Ташкент")
        total = o.get("total_price", 0)
        status = o.get("status", "новый")
        lat, lon = extract_coords(addr)
        yandex_url = f"https://yandex.uz/maps/?rtext=41.2858,69.3402~{lat},{lon}&rtt=auto"

        card = (
            f"▫️ <b>Заказ #WEB-{num}</b> ({status})\n"
            f"📍 <b>Адрес:</b> <code>{addr}</code>\n"
            f"💰 <b>Сумма:</b> <b>{total:,} сум</b>"
        ).replace(",", " ")

        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🙋‍♂️ Взять этот заказ", callback_data=f"courier_claim:{num}")],
            [InlineKeyboardButton(text="🧭 Маршрут на карте", url=yandex_url)]
        ])
        await message.answer(card, parse_mode="HTML", reply_markup=kb)

@router.message(F.text == "📊 Моя статистика")
@router.message(Command("stats"))
async def cmd_my_stats(message: Message):
    user_id = message.from_user.id
    stats = db.get_courier_stats(user_id)

    text = (
        f"📊 <b>СТАТИСТИКА ДОСТАВОК: {message.from_user.full_name}</b>\n\n"
        f"📅 <b>Сегодня доставлено:</b> <b>{stats['today_count']}</b> заказов\n"
        f"💵 Сумма заказов сегодня: <b>{stats['today_sum']:,} сум</b>\n\n"
        f"🏆 <b>Всего выполнено:</b> <b>{stats['total_count']}</b> заказов\n"
        f"💰 Общая сумма за все время: <b>{stats['total_sum']:,} сум</b>\n\n"
        f"⚡ <b>Статус:</b> Активный курьер Fenix"
    ).replace(",", " ")
    await message.answer(text, parse_mode="HTML")

@router.message(F.text == "📍 Маршрут в ресторан FENIX")
@router.message(Command("hub"))
async def cmd_hub_route(message: Message):
    lat, lon = FENIX_HUB_COORDS
    yandex_route = f"https://yandex.uz/maps/?rtext=~{lat},{lon}&rtt=auto"
    yandex_navi = f"yandexnavi://build_route_on_map?lat_to={lat}&lon_to={lon}"

    text = (
        "📍 <b>РЕСТОРАН И ХАБ ДОСТАВКИ FENIX</b>\n\n"
        f"🏢 <b>Адрес:</b> {FENIX_HUB_ADDRESS}\n"
        "📞 <b>Контакты:</b> +998 97 185 00 10 • +998 97 185 00 20\n"
        f"🌐 <b>Сайт:</b> {WEBSITE_URL}\n\n"
        "📲 <i>Быстрый маршрут для Яндекс.Навигатора:</i>\n"
        f"<code>{yandex_navi}</code>"
    )

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🧭 Открыть маршрут в Яндекс Картах", url=yandex_route)]
    ])
    await message.answer(text, parse_mode="HTML", reply_markup=kb)

# ── Runner ─────────────────────────────────────────────────────────────
async def main():
    if not COURIER_BOT_TOKEN:
        logger.error("COURIER_BOT_TOKEN is not configured!")
        return

    logger.info("Initializing FENIX Courier Bot (@%s)...", COURIER_BOT_USERNAME)
    session = AiohttpSession(timeout=35)
    bot = Bot(
        token=COURIER_BOT_TOKEN,
        session=session,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML)
    )
    storage = MemoryStorage()
    dp = Dispatcher(storage=storage)
    dp.include_router(router)

    try:
        await bot.delete_webhook(drop_pending_updates=True)
        me = await bot.get_me()
        logger.info("Courier Bot @%s (ID: %s) connected successfully!", me.username, me.id)
        print("\n" + "=" * 55)
        print(f" [FENIX COURIER BOT] IS ONLINE!")
        print(f" Bot username: @{me.username}")
        print(f" Link: https://t.me/{me.username}")
        print("=" * 55 + "\n")
    except Exception as e:
        logger.error("Error connecting Courier Bot to Telegram API: %s", e)
        return

    try:
        logger.info("Starting polling courier updates...")
        await dp.start_polling(bot, polling_timeout=25)
    finally:
        await bot.session.close()
        logger.info("Courier Bot polling stopped.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        logger.info("Courier Bot terminated.")
