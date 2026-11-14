import random
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, ReplyKeyboardRemove
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext

from menu_data import ITEMS_BY_ID, format_price, get_live_menu_catalog
from keyboards import (
    cart_keyboard,
    empty_cart_keyboard,
    main_reply_keyboard,
    share_phone_keyboard,
    share_location_keyboard,
    order_payment_keyboard,
    order_type_keyboard,
    fast_checkout_keyboard
)
from states import OrderState
from utils import safe_edit_or_send, is_restaurant_open, notify_all_admins, notify_courier_group_new_order
import db

router = Router()

def format_cart_text(cart: dict) -> tuple[str, int]:
    if not cart:
        return "🛒 <b>Ваша корзина пуста.</b>\n\nВыберите блюда из меню, чтобы оформить заказ доставки!", 0
        
    _, live_items = get_live_menu_catalog()
    lines = ["🛒 <b>Ваша корзина заказа:</b>\n"]
    total = 0
    count_items = 0
    
    for dish_id, qty in cart.items():
        item = live_items.get(dish_id)
        if not item:
            continue
        subtotal = item["price"] * qty
        total += subtotal
        count_items += qty
        lines.append(f"▫️ <b>{item['name']}</b>\n   {qty} шт. × {format_price(item['price'])} = <b>{format_price(subtotal)}</b>")
        
    lines.append(f"\n━━━━━━━━━━━━━━━━━━━━")
    lines.append(f"📦 Всего позиций: <b>{count_items} шт.</b>")
    lines.append(f"💰 Итого к оплате: <b>{format_price(total)}</b>")
    lines.append(f"\n<i>Доставка и бронь: 97 185 00 10 • 97 185 00 20</i>")
    
    return "\n".join(lines), total

@router.message(F.text == "🛒 Корзина")
@router.message(Command("cart"))
async def show_cart_message(message: Message):
    user_id = message.from_user.id
    cart = db.get_user_cart(user_id)
    text, total = format_cart_text(cart)
    
    if not cart:
        await message.answer(text, parse_mode="HTML", reply_markup=empty_cart_keyboard())
    else:
        await message.answer(text, parse_mode="HTML", reply_markup=cart_keyboard(cart))

@router.callback_query(F.data == "open_cart")
async def callback_open_cart(callback: CallbackQuery):
    user_id = callback.from_user.id
    cart = db.get_user_cart(user_id)
    text, total = format_cart_text(cart)
    
    kb = cart_keyboard(cart) if cart else empty_cart_keyboard()
    await safe_edit_or_send(callback, text, reply_markup=kb)
    await callback.answer()

@router.callback_query(F.data.startswith("cart_inc:"))
@router.callback_query(F.data.startswith("cart_dec:"))
async def callback_cart_modify(callback: CallbackQuery):
    is_inc = callback.data.startswith("cart_inc:")
    dish_id = callback.data.split(":")[1]
    
    user_id = callback.from_user.id
    cart = db.get_user_cart(user_id)
    
    if dish_id in cart:
        if is_inc:
            cart[dish_id] += 1
        else:
            cart[dish_id] -= 1
            if cart[dish_id] <= 0:
                del cart[dish_id]
                
    db.save_user_cart(user_id, cart)
    text, total = format_cart_text(cart)
    kb = cart_keyboard(cart) if cart else empty_cart_keyboard()
    
    await safe_edit_or_send(callback, text, reply_markup=kb)
    await callback.answer()

@router.callback_query(F.data.startswith("cart_del:"))
async def callback_cart_del(callback: CallbackQuery):
    dish_id = callback.data.split(":")[1]
    user_id = callback.from_user.id
    cart = db.get_user_cart(user_id)
    
    if dish_id in cart:
        del cart[dish_id]
        
    db.save_user_cart(user_id, cart)
    text, total = format_cart_text(cart)
    kb = cart_keyboard(cart) if cart else empty_cart_keyboard()
    
    await safe_edit_or_send(callback, text, reply_markup=kb)
    await callback.answer("Блюдо удалено из корзины")

@router.callback_query(F.data == "cart_clear")
async def callback_cart_clear(callback: CallbackQuery):
    user_id = callback.from_user.id
    db.clear_user_cart(user_id)
    text, total = format_cart_text({})
    await safe_edit_or_send(callback, text, reply_markup=empty_cart_keyboard())
    await callback.answer("Корзина очищена")

# ==================== ORDER CHECKOUT FLOW ====================

@router.message(F.text == "🛵 Оформить доставку")
async def cmd_order_delivery(message: Message, state: FSMContext):
    user_id = message.from_user.id
    cart = db.get_user_cart(user_id)
    if not cart:
        await message.answer(
            "🛒 Ваша корзина пуста!\nПожалуйста, сначала выберите блюда в меню, чтобы оформить доставку.",
            reply_markup=empty_cart_keyboard()
        )
        return
    await start_checkout(message, state)

@router.callback_query(F.data == "checkout_start")
async def callback_checkout_start(callback: CallbackQuery, state: FSMContext):
    user_id = callback.from_user.id
    cart = db.get_user_cart(user_id)
    if not cart:
        await callback.answer("Корзина пуста!", show_alert=True)
        return
        
    _, live_items = get_live_menu_catalog()
    stoplist = db.get_stoplist()
    stopped_in_cart = [live_items[k]["name"] for k in cart if k in live_items and live_items[k]["name"] in stoplist]
    if stopped_in_cart:
        items_str = ", ".join(f'«{name}»' for name in stopped_in_cart)
        await callback.answer(f"⚠️ Блюдо {items_str} сейчас в стоп-листе кухни. Пожалуйста, удалите его из корзины.", show_alert=True)
        return

    await callback.answer()
    await start_checkout(callback.message, state, user_id=callback.from_user.id)

async def start_checkout(message: Message, state: FSMContext, user_id: int = None):
    uid = user_id or (message.from_user.id if message.from_user else None)
    customer = db.get_customer(uid) if uid else None
    
    if customer and customer.get("full_name") and customer.get("phone") and customer.get("default_address"):
        await state.set_state(OrderState.confirm_saved_details)
        await state.update_data(
            customer_name=customer["full_name"],
            customer_phone=customer["phone"],
            customer_address=customer["default_address"]
        )
        fast_text = (
            "🚀 <b>БЫСТРОЕ ОФОРМЛЕНИЕ ЗАКАЗА (В 1 КЛИК)</b>\n\n"
            "У вас уже сохранены данные доставки:\n"
            f"👤 <b>Получатель:</b> {customer['full_name']}\n"
            f"📞 <b>Телефон:</b> <code>{customer['phone']}</code>\n"
            f"📍 <b>Адрес:</b> <i>{customer['default_address']}</i>\n\n"
            "<i>Использовать эти данные для быстрой доставки или изменить вручную?</i>"
        )
        await message.answer(fast_text, parse_mode="HTML", reply_markup=fast_checkout_keyboard())
        return

    await start_manual_checkout(message, state)

async def start_manual_checkout(message: Message, state: FSMContext):
    await state.set_state(OrderState.waiting_for_type)
    text = (
        "🛵 <b>Оформление заказа в FENIX RESTAURANT & BAR</b>\n\n"
        "Шаг 1 из 5: Выберите способ получения заказа:"
    )
    await message.answer(text, parse_mode="HTML", reply_markup=order_type_keyboard())

# Handlers for 1-Click Fast Checkout
@router.callback_query(OrderState.confirm_saved_details, F.data.startswith("fast_chk:"))
async def fast_checkout_selected(callback: CallbackQuery, state: FSMContext):
    action = callback.data.split(":")[1]
    if action == "cancel":
        await state.clear()
        is_adm = db.is_staff(callback.from_user.id)
        await callback.message.edit_text("Оформление заказа отменено.")
        await callback.message.answer("Главное меню:", reply_markup=main_reply_keyboard(is_admin=is_adm))
        await callback.answer()
        return

    if action == "manual":
        await callback.answer()
        await start_manual_checkout(callback.message, state)
        return

    if action == "delivery":
        await state.update_data(order_type="Доставка курьером")
        await state.set_state(OrderState.waiting_for_payment)
        await callback.message.edit_text(
            "Способ получения: <b>Доставка курьером (быстрый заказ)</b>\n\n"
            "Шаг 2 из 2: Подтвердите способ оплаты (наличными при получении):",
            parse_mode="HTML",
            reply_markup=order_payment_keyboard()
        )
        await callback.answer()
        return

    if action == "pickup":
        await state.update_data(
            order_type="Самовывоз из ресторана",
            customer_address="Самовывоз из ресторана (ул. Хуснабад, 5 проезд, 1а)"
        )
        await state.set_state(OrderState.waiting_for_payment)
        await callback.message.edit_text(
            "Способ получения: <b>Самовывоз из ресторана (быстрый заказ)</b>\n\n"
            "Шаг 2 из 2: Подтвердите способ оплаты (наличными при получении):",
            parse_mode="HTML",
            reply_markup=order_payment_keyboard()
        )
        await callback.answer()
        return

@router.callback_query(OrderState.waiting_for_type, F.data.startswith("ord_type:"))
async def order_type_selected(callback: CallbackQuery, state: FSMContext):
    ord_type = callback.data.split(":")[1]
    type_label = "🛵 Доставка курьером" if ord_type == "delivery" else "🛍 Самовывоз из ресторана"
    await state.update_data(order_type=type_label)
    await callback.answer()
    
    await state.set_state(OrderState.waiting_for_name)
    await callback.message.answer(
        f"Способ получения: <b>{type_label}</b>\n\n"
        "Шаг 2 из 5: Напишите, как к вам обращаться (Ваше имя):",
        parse_mode="HTML",
        reply_markup=ReplyKeyboardRemove()
    )

@router.message(OrderState.waiting_for_name)
async def order_name_received(message: Message, state: FSMContext):
    name = message.text.strip()
    if not name or len(name) < 2:
        await message.answer("Пожалуйста, введите корректное имя:")
        return
        
    await state.update_data(customer_name=name)
    await state.set_state(OrderState.waiting_for_phone)
    await message.answer(
        f"Приятно познакомиться, {name}!\n\n"
        "Шаг 3 из 5: Укажите номер телефона для связи и подтверждения заказа.\n"
        "Вы можете нажать кнопку ниже или отправить номер вручную:",
        reply_markup=share_phone_keyboard()
    )

@router.message(OrderState.waiting_for_phone, F.contact)
@router.message(OrderState.waiting_for_phone, F.text)
async def order_phone_received(message: Message, state: FSMContext):
    is_adm = db.is_staff(message.from_user.id)
    if message.text == "❌ Отмена":
        await state.clear()
        await message.answer("Оформление заказа отменено.", reply_markup=main_reply_keyboard(is_admin=is_adm))
        return
        
    if message.contact:
        phone = message.contact.phone_number
        if not phone.startswith("+"):
            phone = "+" + phone
    else:
        phone = message.text.strip()
        
    await state.update_data(customer_phone=phone)
    data = await state.get_data()
    ord_type = data.get("order_type", "")
    
    if "Самовывоз" in ord_type:
        await state.update_data(customer_address="Самовывоз из ресторана (ул. Хуснабад, 5 проезд, 1а)")
        await state.set_state(OrderState.waiting_for_payment)
        await message.answer(
            "Шаг 4 из 5: Подтвердите способ оплаты (наличными при получении):",
            reply_markup=order_payment_keyboard()
        )
    else:
        await state.set_state(OrderState.waiting_for_address)
        await message.answer(
            "Шаг 4 из 5: Укажите адрес доставки в Ташкенте (улица, дом, квартира, ориентир)\n"
            "или отправьте текущую геопозицию с помощью кнопки ниже:",
            reply_markup=share_location_keyboard()
        )

@router.message(OrderState.waiting_for_address, F.location)
@router.message(OrderState.waiting_for_address, F.text)
async def order_address_received(message: Message, state: FSMContext):
    is_adm = db.is_staff(message.from_user.id)
    if message.text == "❌ Отмена":
        await state.clear()
        await message.answer("Оформление заказа отменено.", reply_markup=main_reply_keyboard(is_admin=is_adm))
        return
        
    if message.location:
        lat = message.location.latitude
        lon = message.location.longitude
        address = f"Геопозиция: https://maps.google.com/?q={lat},{lon}"
    else:
        address = message.text.strip()
        
    await state.update_data(customer_address=address)
    await state.set_state(OrderState.waiting_for_payment)
    await message.answer(
        "Шаг 5 из 5: Подтвердите способ оплаты (наличными при получении):",
        reply_markup=order_payment_keyboard()
    )

@router.callback_query(OrderState.waiting_for_payment, F.data.startswith("pay:"))
async def order_payment_received(callback: CallbackQuery, state: FSMContext):
    payment = callback.data.split(":")[1]
    await state.update_data(payment_method=payment)
    await callback.answer()
    
    user_id = callback.from_user.id
    cart = db.get_user_cart(user_id)
    data = await state.get_data()
    
    order_num = random.randint(1000, 9999)
    _, live_items = get_live_menu_catalog()
    total = sum(live_items[k]["price"] * v for k, v in cart.items() if k in live_items)
    
    # Check working hours
    is_open, current_time = is_restaurant_open()
    hours_note = ""
    if not is_open:
        hours_note = (
            "\n\n🌙 <b>Внимание: ресторан сейчас не работает</b> (часы работы: 11:00 — 23:00).\n"
            "Ваш заказ зафиксирован в очереди и будет передан на кухню в 11:00!"
        )
    
    # Format items with real dish names and prices for unified Admin OS & kitchen display
    named_items = {}
    for dish_id, qty in cart.items():
        it = live_items.get(dish_id)
        if it:
            named_items[it["name"]] = {"qty": qty, "price": it["price"]}
        else:
            named_items[dish_id] = {"qty": qty, "price": 0}

    # Save to SQLite database
    db.create_order(
        order_num=order_num,
        user_id=user_id,
        user_name=callback.from_user.username or "",
        customer_name=data.get("customer_name", ""),
        customer_phone=data.get("customer_phone", ""),
        order_type=data.get("order_type", ""),
        address=data.get("customer_address", ""),
        payment_method=payment,
        items=named_items,
        total_price=total
    )

    # Auto-update guest profile in customers table
    try:
        is_delivery = "доставка" in str(data.get("order_type", "")).lower()
        db.upsert_customer(
            user_id=user_id,
            full_name=data.get("customer_name"),
            phone=data.get("customer_phone"),
            default_address=data.get("customer_address") if is_delivery else None
        )
    except Exception:
        pass
    
    summary = [
        f"<b>ЗАКАЗ №{order_num} ПРИНЯТ В ОБРАБОТКУ!</b>\n",
        f"<b>Клиент:</b> {data.get('customer_name')}",
        f"<b>Телефон:</b> {data.get('customer_phone')}",
        f"<b>Способ получения:</b> {data.get('order_type')}",
        f"<b>Адрес:</b> {data.get('customer_address')}",
        f"<b>Оплата:</b> Наличными при получении\n",
        "<b>Состав заказа:</b>"
    ]
    for dish_id, qty in cart.items():
        it = live_items.get(dish_id)
        if it:
            summary.append(f"- {it['name']} x {qty} = {format_price(it['price'] * qty)}")
            
    summary.append(f"\n<b>ИТОГО К ОПЛАТЕ: {format_price(total)}</b>")
    summary.append("Информация: Оплата принимается наличными курьеру или при самовывозе.")
    summary.append("━━━━━━━━━━━━━━━━━━━━")
    summary.append("Наш менеджер свяжется с вами для подтверждения и отправки на кухню.")
    summary.append("Горячая линия ресторана: <b>97 185 00 10 • 97 185 00 20</b>")
    if hours_note:
        summary.append(hours_note)
    
    summary_text = "\n".join(summary)
    
    from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

    payment_buttons = [
        [
            InlineKeyboardButton(text="Мой профиль / Заказы", callback_data="view_profile"),
            InlineKeyboardButton(text="Меню ресторана", callback_data="cuisines_menu")
        ]
    ]

    # Clear user's cart in DB
    db.clear_user_cart(user_id)
    await state.clear()
    
    is_adm = db.is_staff(user_id)
    await callback.message.answer(
        summary_text,
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=payment_buttons)
    )
    await callback.message.answer(
        "Вы можете в любой момент отслеживать статус заказа в меню:",
        reply_markup=main_reply_keyboard(is_admin=is_adm)
    )
    
    # Notify staff & admins
    admin_alert = f"🔔 <b>НОВЫЙ ЗАКАЗ В РЕСТОРАНЕ!</b>\n\n{summary_text}"
    await notify_all_admins(callback.bot, admin_alert)

    # Auto-dispatch to Courier Group if delivery
    if "доставка" in str(data.get("order_type", "")).lower():
        try:
            await notify_courier_group_new_order(
                order_num=order_num,
                customer_name=data.get("customer_name", "Клиент"),
                phone=data.get("customer_phone", ""),
                address=data.get("customer_address", "Ташкент"),
                items=named_items,
                total_price=total,
                pay_method=payment
            )
        except Exception:
            pass
