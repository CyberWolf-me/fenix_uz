import json
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, ReplyKeyboardRemove
from aiogram.fsm.context import FSMContext
try:
    from states import ProfileState
    from keyboards import (
        profile_inline_keyboard,
        language_select_keyboard,
        order_repeat_keyboard,
        share_phone_keyboard,
        share_location_keyboard,
        main_reply_keyboard
    )
    from menu_data import format_price, ITEMS_BY_ID
    import db
except ImportError:
    from bot.states import ProfileState
    from bot.keyboards import (
        profile_inline_keyboard,
        language_select_keyboard,
        order_repeat_keyboard,
        share_phone_keyboard,
        share_location_keyboard,
        main_reply_keyboard
    )
    from bot.menu_data import format_price, ITEMS_BY_ID
    from bot import db

router = Router()

def build_profile_text(user_id: int, user_first_name: str = "") -> tuple[str, dict]:
    customer = db.get_customer(user_id)
    if not customer:
        customer = db.upsert_customer(user_id, full_name=user_first_name or "Гость FENIX")
    
    phone = customer.get("phone") or ""
    address = customer.get("default_address") or ""
    lang = customer.get("language") or "ru"
    lang_names = {"ru": "🇷🇺 Русский", "uz": "🇺🇿 O'zbekcha", "en": "🇬🇧 English"}
    lang_label = lang_names.get(lang, "🇷🇺 Русский")
    
    cashback = db.get_customer_cashback(user_id, phone if phone else None)
    
    orders = db.get_customer_orders(user_id, phone if phone else None, limit=10)
    active_orders = [o for o in orders if o.get("status") not in ("выполнен", "отменен", "доставлен клиенту")]
    
    res_list = db.get_customer_reservations(user_id, phone if phone else None, limit=10)
    active_res = [r for r in res_list if "отменен" not in str(r.get("status", "")).lower()]
    
    name_display = customer.get("full_name") or user_first_name or "Гость FENIX"
    phone_display = phone if phone else "Не указан"
    addr_display = address if address else "Не указан"
    
    text = (
        f"👤 <b>ЛИЧНЫЙ ПРОФИЛЬ ГОСТЯ FENIX</b>\n\n"
        f"▫️ <b>Имя:</b> {name_display}\n"
        f"▫️ <b>Телефон:</b> <code>{phone_display}</code>\n"
        f"▫️ <b>Адрес доставки:</b> <i>{addr_display}</i>\n"
        f"▫️ <b>Язык интерфейса:</b> {lang_label}\n\n"
        f"📦 Активных заказов в работе: <b>{len(active_orders)}</b>\n"
        f"📅 Активных броней столов: <b>{len(active_res)}</b>\n\n"
        f"<i>Управляйте своими данными и заказами с помощью кнопок ниже:</i>"
    )
    return text, customer

# Entry points via Reply Button or Commands
@router.message(F.text.in_(["👤 Мой профиль / Заказы", "👤 Мой профиль", "Профиль", "👤 Профиль", "/profile"]))
async def cmd_profile(message: Message, state: FSMContext):
    await state.clear()
    text, _ = build_profile_text(message.from_user.id, message.from_user.first_name)
    await message.answer(text, parse_mode="HTML", reply_markup=profile_inline_keyboard())

@router.callback_query(F.data == "view_profile")
async def cb_view_profile(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    text, _ = build_profile_text(callback.from_user.id, callback.from_user.first_name)
    try:
        await callback.message.edit_text(text, parse_mode="HTML", reply_markup=profile_inline_keyboard())
    except Exception:
        await callback.message.answer(text, parse_mode="HTML", reply_markup=profile_inline_keyboard())
    await callback.answer()

# 1. View Orders History
@router.callback_query(F.data == "profile:orders")
async def cb_profile_orders(callback: CallbackQuery):
    user_id = callback.from_user.id
    customer = db.get_customer(user_id) or {}
    phone = customer.get("phone")
    orders = db.get_customer_orders(user_id, phone if phone else None, limit=5)
    
    if not orders:
        text = (
            "📦 <b>ВАШИ ЗАКАЗЫ</b>\n\n"
            "У вас пока нет оформленных заказов в FENIX RESTOBAR.\n"
            "Вы можете открыть наше меню или перейти в корзину для оформления первой доставки!"
        )
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📖 Открыть меню", callback_data="cuisines_menu")],
            [InlineKeyboardButton(text="🔙 Назад к профилю", callback_data="view_profile")]
        ])
        await callback.message.edit_text(text, parse_mode="HTML", reply_markup=kb)
        await callback.answer()
        return

    text_parts = ["📦 <b>ПОСЛЕДНИЕ ЗАКАЗЫ В FENIX RESTOBAR</b>\n"]
    for o in orders:
        onum = o.get("order_num") or o.get("id")
        created = str(o.get("created_at") or "")[:16]
        otype = o.get("order_type") or "Доставка"
        st = o.get("status") or "новый"
        total = format_price(o.get("total_price") or 0)
        
        # Parse items count
        items_summary = []
        try:
            ij = json.loads(o.get("items_json") or "{}")
            for iname, qty in list(ij.items())[:3]:
                items_summary.append(f"• {iname} × {qty}")
            if len(ij) > 3:
                items_summary.append(f"• ...и еще {len(ij) - 3} поз.")
        except Exception:
            pass

        st_badge = "⏳ Ожидает" if "нов" in st.lower() else "👨‍🍳 Готовится" if "кухн" in st.lower() or "готов" in st.lower() else "🛵 В пути" if "пут" in st.lower() else "✅ Выполнен" if "достав" in st.lower() or "выполн" in st.lower() else f"ℹ️ {st}"
        
        item_block = "\n".join(items_summary) if items_summary else "• Детализация в чеке"
        text_parts.append(
            f"<b>Заказ #WEB-{onum}</b> ({created})\n"
            f"Тип: {otype} | Статус: <b>{st_badge}</b>\n"
            f"{item_block}\n"
            f"Сумма: <b>{total}</b>\n"
            f"━━━━━━━━━━━━━━━━━━━"
        )
    
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    buttons = []
    # Add 1-click repeat buttons for top orders
    for o in orders[:3]:
        onum = o.get("order_num") or o.get("id")
        buttons.append([InlineKeyboardButton(text=f"🔄 Повторить заказ #WEB-{onum}", callback_data=f"repeat_order:{onum}")])
    buttons.append([InlineKeyboardButton(text="🔙 Назад к профилю", callback_data="view_profile")])
    
    await callback.message.edit_text("\n\n".join(text_parts), parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    await callback.answer()

# Repeat Order Action
@router.callback_query(F.data.startswith("repeat_order:"))
async def cb_repeat_order(callback: CallbackQuery):
    order_num = callback.data.split(":")[1]
    conn = db.get_connection()
    c = conn.cursor()
    row = c.execute("SELECT * FROM orders WHERE order_num = ? OR id = ?", (order_num, order_num)).fetchone()
    conn.close()
    
    if not row or not row["items_json"]:
        await callback.answer("Не удалось загрузить данные заказа для повтора", show_alert=True)
        return

    try:
        items_dict = json.loads(row["items_json"])
    except Exception:
        await callback.answer("Ошибка формата состава заказа", show_alert=True)
        return

    # Map dish names to item IDs
    cart_to_save = {}
    name_to_id = {v["name"].strip().lower(): k for k, v in ITEMS_BY_ID.items()}
    for dish_name, qty in items_dict.items():
        clean_name = dish_name.strip().lower()
        if clean_name in name_to_id:
            cart_to_save[name_to_id[clean_name]] = int(qty)
        elif dish_name in ITEMS_BY_ID:
            cart_to_save[dish_name] = int(qty)
        else:
            # Fallback fuzzy match
            matched = False
            for k, it in ITEMS_BY_ID.items():
                if it["name"].lower() in clean_name or clean_name in it["name"].lower():
                    cart_to_save[k] = int(qty)
                    matched = True
                    break

    if not cart_to_save:
        await callback.answer("Блюда из этого заказа временно отсутствуют в активном меню", show_alert=True)
        return

    db.save_user_cart(callback.from_user.id, cart_to_save)
    await callback.answer("Позиции добавлены в корзину!", show_alert=True)
    
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    text = (
        f"✅ <b>Заказ #WEB-{order_num} успешно повторен!</b>\n\n"
        f"Все позиции загружены в вашу корзину ({len(cart_to_save)} поз.).\n"
        f"Вы можете проверить количество или сразу перейти к оплате:"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🛒 Открыть корзину и оформить", callback_data="open_cart")],
        [InlineKeyboardButton(text="👤 Вернуться в профиль", callback_data="view_profile")]
    ])
    await callback.message.edit_text(text, parse_mode="HTML", reply_markup=kb)

# 2. View Reservations
@router.callback_query(F.data == "profile:reservations")
async def cb_profile_reservations(callback: CallbackQuery):
    user_id = callback.from_user.id
    customer = db.get_customer(user_id) or {}
    phone = customer.get("phone")
    res_list = db.get_customer_reservations(user_id, phone if phone else None, limit=5)
    
    if not res_list:
        text = (
            "📅 <b>ВАШИ БРОНИ СТОЛОВ</b>\n\n"
            "У вас пока нет активных заявок на бронирование столов в FENIX RESTOBAR.\n"
            "Вы можете забронировать столик прямо сейчас!"
        )
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
        kb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📅 Забронировать стол", callback_data="start_reservation")],
            [InlineKeyboardButton(text="🔙 Назад к профилю", callback_data="view_profile")]
        ])
        await callback.message.edit_text(text, parse_mode="HTML", reply_markup=kb)
        await callback.answer()
        return

    text_parts = ["📅 <b>ВАШИ БРОНИ СТОЛОВ В FENIX RESTOBAR</b>\n"]
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
    buttons = []
    
    for r in res_list:
        code = r.get("code") or r.get("id")
        rdate = r.get("res_date") or ""
        rtime = r.get("res_time") or ""
        guests = r.get("guests") or 2
        zone = r.get("zone") or "Основной зал"
        table = r.get("table_assigned") or "Назначается хостес"
        st = r.get("status") or "ожидает подтверждения"
        
        is_cancelled = "отменен" in st.lower()
        st_badge = "❌ Отменена" if is_cancelled else "✅ Подтверждена" if "подтвержд" in st.lower() else "🍽 Посажен" if "посаж" in st.lower() else "⏳ В обработке"
        
        text_parts.append(
            f"<b>Бронь #WEB-{code}</b>\n"
            f"Дата и время: <b>{rdate} в {rtime}</b>\n"
            f"Гостей: <b>{guests} чел.</b> | Зал: {zone}\n"
            f"Стол: <b>{table}</b>\n"
            f"Статус: <b>{st_badge}</b>\n"
            f"━━━━━━━━━━━━━━━━━━━"
        )
        if not is_cancelled and "посаж" not in st.lower():
            buttons.append([InlineKeyboardButton(text=f"❌ Отменить бронь #WEB-{code}", callback_data=f"cancel_res:{code}")])
            
    buttons.append([InlineKeyboardButton(text="🔙 Назад к профилю", callback_data="view_profile")])
    
    await callback.message.edit_text("\n\n".join(text_parts), parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
    await callback.answer()

# Cancel Reservation Action
@router.callback_query(F.data.startswith("cancel_res:"))
async def cb_cancel_res(callback: CallbackQuery):
    code = callback.data.split(":")[1]
    success = db.cancel_customer_reservation(code, callback.from_user.id)
    if success:
        await callback.answer("Бронь успешно отменена", show_alert=True)
    else:
        await callback.answer("Не удалось отменить бронь", show_alert=True)
    # Refresh list
    await cb_profile_reservations(callback)

# 3. Edit Profile Fields
@router.callback_query(F.data == "profile:edit_address")
async def cb_edit_address(callback: CallbackQuery, state: FSMContext):
    await state.set_state(ProfileState.waiting_for_address)
    await callback.message.answer(
        "📍 <b>Изменение адреса доставки</b>\n\n"
        "Отправьте текстом ваш адрес в Ташкенте (район, улица, дом, квартира, ориентир)\n"
        "или нажмите кнопку 'Отправить локацию' на клавиатуре:",
        parse_mode="HTML",
        reply_markup=share_location_keyboard()
    )
    await callback.answer()

@router.message(ProfileState.waiting_for_address, F.location)
@router.message(ProfileState.waiting_for_address, F.text)
async def process_new_address(message: Message, state: FSMContext):
    is_adm = db.is_staff(message.from_user.id)
    if message.text == "❌ Отмена":
        await state.clear()
        await message.answer("Изменение адреса отменено.", reply_markup=main_reply_keyboard(is_admin=is_adm))
        return

    if message.location:
        lat = message.location.latitude
        lon = message.location.longitude
        address = f"Геопозиция: https://maps.google.com/?q={lat},{lon}"
    else:
        address = message.text.strip()
        
    db.upsert_customer(message.from_user.id, default_address=address)
    await state.clear()
    
    text, _ = build_profile_text(message.from_user.id, message.from_user.first_name)
    await message.answer("✅ Адрес доставки успешно сохранен!", reply_markup=main_reply_keyboard(is_admin=is_adm))
    await message.answer(text, parse_mode="HTML", reply_markup=profile_inline_keyboard())

@router.callback_query(F.data == "profile:edit_phone")
async def cb_edit_phone(callback: CallbackQuery, state: FSMContext):
    await state.set_state(ProfileState.waiting_for_phone)
    await callback.message.answer(
        "📞 <b>Изменение контактного номера</b>\n\n"
        "Отправьте ваш номер телефона (+998...) или воспользуйтесь кнопкой 'Поделиться контактом' ниже:",
        parse_mode="HTML",
        reply_markup=share_phone_keyboard()
    )
    await callback.answer()

@router.message(ProfileState.waiting_for_phone, F.contact)
@router.message(ProfileState.waiting_for_phone, F.text)
async def process_new_phone(message: Message, state: FSMContext):
    is_adm = db.is_staff(message.from_user.id)
    if message.text == "❌ Отмена":
        await state.clear()
        await message.answer("Изменение номера отменено.", reply_markup=main_reply_keyboard(is_admin=is_adm))
        return

    if message.contact:
        phone = message.contact.phone_number
        if not phone.startswith("+"):
            phone = "+" + phone
    else:
        phone = message.text.strip()

    db.upsert_customer(message.from_user.id, phone=phone)
    await state.clear()
    
    text, _ = build_profile_text(message.from_user.id, message.from_user.first_name)
    await message.answer("✅ Номер телефона успешно обновлен!", reply_markup=main_reply_keyboard(is_admin=is_adm))
    await message.answer(text, parse_mode="HTML", reply_markup=profile_inline_keyboard())

@router.callback_query(F.data == "profile:edit_name")
async def cb_edit_name(callback: CallbackQuery, state: FSMContext):
    await state.set_state(ProfileState.waiting_for_name)
    await callback.message.answer(
        "👤 <b>Изменение имени</b>\n\n"
        "Напишите, как к вам обращаться при оформлении заказов и бронировании столов:",
        parse_mode="HTML",
        reply_markup=ReplyKeyboardRemove()
    )
    await callback.answer()

@router.message(ProfileState.waiting_for_name, F.text)
async def process_new_name(message: Message, state: FSMContext):
    name = message.text.strip()
    if len(name) < 2:
        await message.answer("Пожалуйста, введите корректное имя:")
        return

    db.upsert_customer(message.from_user.id, full_name=name)
    await state.clear()
    
    is_adm = db.is_staff(message.from_user.id)
    text, _ = build_profile_text(message.from_user.id, message.from_user.first_name)
    await message.answer("✅ Ваше имя успешно обновлено!", reply_markup=main_reply_keyboard(is_admin=is_adm))
    await message.answer(text, parse_mode="HTML", reply_markup=profile_inline_keyboard())

# 4. Language Selection
@router.callback_query(F.data == "profile:change_lang")
async def cb_change_lang(callback: CallbackQuery):
    text = (
        "🌐 <b>Выбор языка / Tilni tanlash / Language selection</b>\n\n"
        "Выберите удобный язык для общения с рестораном и работы с ботом:"
    )
    await callback.message.edit_text(text, parse_mode="HTML", reply_markup=language_select_keyboard())
    await callback.answer()

@router.callback_query(F.data.startswith("set_lang:"))
async def cb_set_lang(callback: CallbackQuery):
    lang = callback.data.split(":")[1]
    db.set_user_language(callback.from_user.id, lang)
    
    resp_text = {
        "ru": "🇷🇺 Язык интерфейса изменен на Русский!",
        "uz": "🇺🇿 Interfeys tili O'zbekchaga o'zgartirildi!",
        "en": "🇬🇧 Interface language switched to English!"
    }.get(lang, "Язык обновлен!")
    
    await callback.answer(resp_text, show_alert=True)
    text, _ = build_profile_text(callback.from_user.id, callback.from_user.first_name)
    await callback.message.edit_text(text, parse_mode="HTML", reply_markup=profile_inline_keyboard())
