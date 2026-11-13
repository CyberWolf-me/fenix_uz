import random
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, ReplyKeyboardRemove
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext

from menu_data import ITEMS_BY_ID, format_price
from keyboards import (
    cart_keyboard,
    empty_cart_keyboard,
    main_reply_keyboard,
    share_phone_keyboard,
    share_location_keyboard,
    order_payment_keyboard,
    order_type_keyboard
)
from states import OrderState
from utils import safe_edit_or_send, is_restaurant_open, notify_all_admins
import db

router = Router()

def format_cart_text(cart: dict) -> tuple[str, int]:
    if not cart:
        return "🛒 <b>Ваша корзина пуста.</b>\n\nВыберите блюда из меню, чтобы оформить заказ доставки!", 0
        
    lines = ["🛒 <b>Ваша корзина заказа:</b>\n"]
    total = 0
    count_items = 0
    
    for dish_id, qty in cart.items():
        item = ITEMS_BY_ID.get(dish_id)
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
    await callback.answer()
    await start_checkout(callback.message, state)

async def start_checkout(message: Message, state: FSMContext):
    await state.set_state(OrderState.waiting_for_type)
    text = (
        "🛵 <b>Оформление заказа в FENIX RESTAURANT & BAR</b>\n\n"
        "Шаг 1 из 5: Выберите способ получения заказа:"
    )
    await message.answer(text, parse_mode="HTML", reply_markup=order_type_keyboard())

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
            "Шаг 4 из 5: Выберите удобный способ оплаты:",
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
        "Шаг 5 из 5: Выберите способ оплаты:",
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
    total = sum(ITEMS_BY_ID[k]["price"] * v for k, v in cart.items() if k in ITEMS_BY_ID)
    
    # Check working hours
    is_open, current_time = is_restaurant_open()
    hours_note = ""
    if not is_open:
        hours_note = (
            "\n\n🌙 <b>Внимание: ресторан сейчас не работает</b> (часы работы: 11:00 — 23:00).\n"
            "Ваш заказ зафиксирован в очереди и будет передан на кухню в 11:00!"
        )
    
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
        items=cart,
        total_price=total
    )
    
    summary = [
        f"🎉 <b>ЗАКАЗ №{order_num} ПРИНЯТ В ОБРАБОТКУ!</b>\n",
        f"👤 <b>Клиент:</b> {data.get('customer_name')}",
        f"📞 <b>Телефон:</b> {data.get('customer_phone')}",
        f"🛵 <b>Способ получения:</b> {data.get('order_type')}",
        f"📍 <b>Адрес:</b> {data.get('customer_address')}",
        f"💳 <b>Оплата:</b> {payment}\n",
        "📋 <b>Состав заказа:</b>"
    ]
    for dish_id, qty in cart.items():
        it = ITEMS_BY_ID.get(dish_id)
        if it:
            summary.append(f"▫️ {it['name']} × {qty} = {format_price(it['price'] * qty)}")
            
    summary.append(f"\n💰 <b>ИТОГО К ОПЛАТЕ: {format_price(total)}</b>")
    summary.append("━━━━━━━━━━━━━━━━━━━━")
    summary.append("Наш менеджер свяжется с вами для подтверждения и отправки на кухню.")
    summary.append("📞 Горячая линия ресторана: <b>97 185 00 10 • 97 185 00 20</b>")
    if hours_note:
        summary.append(hours_note)
    
    summary_text = "\n".join(summary)
    
    # Clear user's cart in DB
    db.clear_user_cart(user_id)
    await state.clear()
    
    is_adm = db.is_staff(user_id)
    await callback.message.answer(
        summary_text,
        parse_mode="HTML",
        reply_markup=main_reply_keyboard(is_admin=is_adm)
    )
    
    # Notify staff & admins
    admin_alert = f"🔔 <b>НОВЫЙ ЗАКАЗ В РЕСТОРАНЕ!</b>\n\n{summary_text}"
    await notify_all_admins(callback.bot, admin_alert)
