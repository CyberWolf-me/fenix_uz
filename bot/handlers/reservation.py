import random
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, ReplyKeyboardRemove
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext

from states import ReservationState
from keyboards import (
    reservation_date_keyboard,
    reservation_time_keyboard,
    reservation_guests_keyboard,
    reservation_zone_keyboard,
    share_phone_keyboard,
    main_reply_keyboard
)
from utils import safe_edit_or_send, notify_all_admins
import db

router = Router()

@router.message(F.text == "📅 Забронировать стол")
@router.message(Command("reserve"))
async def start_reservation(message: Message, state: FSMContext):
    await state.clear()
    await state.set_state(ReservationState.waiting_for_date)
    text = (
        "📅 <b>Бронирование столика в FENIX RESTAURANT & BAR</b>\n\n"
        "Мы с удовольствием подготовим лучший столик для вашего отдыха или праздника.\n\n"
        "Шаг 1 из 5: Выберите дату визита:"
    )
    await message.answer(text, parse_mode="HTML", reply_markup=reservation_date_keyboard())

@router.callback_query(ReservationState.waiting_for_date, F.data.startswith("res_date:"))
async def reservation_date_selected(callback: CallbackQuery, state: FSMContext):
    date_val = callback.data.split(":")[1]
    if date_val == "custom":
        await callback.message.answer("Пожалуйста, напишите дату визита текстом (например: 15 ноября):")
        await callback.answer()
        return
        
    await state.update_data(res_date=date_val)
    await state.set_state(ReservationState.waiting_for_time)
    await callback.answer()
    
    await safe_edit_or_send(
        callback,
        f"📅 Дата визита: <b>{date_val}</b>\n\n"
        "Шаг 2 из 5: Выберите время визита:",
        reply_markup=reservation_time_keyboard()
    )

@router.message(ReservationState.waiting_for_date)
async def reservation_custom_date(message: Message, state: FSMContext):
    date_val = message.text.strip()
    await state.update_data(res_date=date_val)
    await state.set_state(ReservationState.waiting_for_time)
    await message.answer(
        f"📅 Дата визита: <b>{date_val}</b>\n\n"
        "Шаг 2 из 5: Выберите время визита:",
        parse_mode="HTML",
        reply_markup=reservation_time_keyboard()
    )

@router.callback_query(ReservationState.waiting_for_time, F.data.startswith("res_time:"))
async def reservation_time_selected(callback: CallbackQuery, state: FSMContext):
    time_val = callback.data.split(":")[1]
    if time_val == "custom":
        await callback.message.answer("Пожалуйста, напишите желаемое время (например: 19:30):")
        await callback.answer()
        return
        
    await state.update_data(res_time=time_val)
    await state.set_state(ReservationState.waiting_for_guests)
    await callback.answer()
    
    data = await state.get_data()
    await safe_edit_or_send(
        callback,
        f"📅 Дата: <b>{data.get('res_date')}</b>\n"
        f"⏰ Время: <b>{time_val}</b>\n\n"
        "Шаг 3 из 5: Укажите количество гостей:",
        reply_markup=reservation_guests_keyboard()
    )

@router.message(ReservationState.waiting_for_time)
async def reservation_custom_time(message: Message, state: FSMContext):
    time_val = message.text.strip()
    await state.update_data(res_time=time_val)
    await state.set_state(ReservationState.waiting_for_guests)
    data = await state.get_data()
    await message.answer(
        f"📅 Дата: <b>{data.get('res_date')}</b>\n"
        f"⏰ Время: <b>{time_val}</b>\n\n"
        "Шаг 3 из 5: Укажите количество гостей:",
        parse_mode="HTML",
        reply_markup=reservation_guests_keyboard()
    )

@router.callback_query(ReservationState.waiting_for_guests, F.data.startswith("res_guests:"))
async def reservation_guests_selected(callback: CallbackQuery, state: FSMContext):
    guests_val = callback.data.split(":")[1]
    await state.update_data(res_guests=guests_val)
    await state.set_state(ReservationState.waiting_for_zone)
    await callback.answer()
    
    data = await state.get_data()
    await safe_edit_or_send(
        callback,
        f"📅 Дата: <b>{data.get('res_date')}</b>\n"
        f"⏰ Время: <b>{data.get('res_time')}</b>\n"
        f"👥 Гости: <b>{guests_val}</b>\n\n"
        "Шаг 4 из 5: Выберите желаемую зону ресторана:",
        reply_markup=reservation_zone_keyboard()
    )

@router.callback_query(ReservationState.waiting_for_zone, F.data.startswith("res_zone:"))
async def reservation_zone_selected(callback: CallbackQuery, state: FSMContext):
    zone_val = callback.data.split(":")[1]
    await state.update_data(res_zone=zone_val)
    await state.set_state(ReservationState.waiting_for_name)
    await callback.answer()
    
    await callback.message.answer(
        "Шаг 5 из 5: Как к вам обращаться (Ваше имя)?",
        reply_markup=ReplyKeyboardRemove()
    )

@router.message(ReservationState.waiting_for_name)
async def reservation_name_received(message: Message, state: FSMContext):
    name = message.text.strip()
    if not name or len(name) < 2:
        await message.answer("Пожалуйста, введите ваше имя:")
        return
        
    await state.update_data(res_name=name)
    await state.set_state(ReservationState.waiting_for_phone)
    await message.answer(
        f"Благодарим, {name}!\n\n"
        "Остался последний шаг — укажите номер телефона для подтверждения брони менеджером.\n"
        "Нажмите кнопку ниже или введите номер вручную:",
        reply_markup=share_phone_keyboard()
    )

@router.message(ReservationState.waiting_for_phone, F.contact)
@router.message(ReservationState.waiting_for_phone, F.text)
async def reservation_phone_received(message: Message, state: FSMContext):
    user_id = message.from_user.id
    is_adm = db.is_staff(user_id)
    if message.text == "❌ Отмена":
        await state.clear()
        await message.answer("Бронирование отменено.", reply_markup=main_reply_keyboard(is_admin=is_adm))
        return
        
    if message.contact:
        phone = message.contact.phone_number
        if not phone.startswith("+"):
            phone = "+" + phone
    else:
        phone = message.text.strip()
        
    await state.update_data(res_phone=phone)
    data = await state.get_data()
    res_code = random.randint(100, 999)
    
    # Save to SQLite database
    db.create_reservation(
        code=res_code,
        user_id=user_id,
        user_name=message.from_user.username or "",
        customer_name=data.get("res_name", ""),
        customer_phone=phone,
        res_date=data.get("res_date", ""),
        res_time=data.get("res_time", ""),
        guests=data.get("res_guests", ""),
        zone=data.get("res_zone", "")
    )
    
    res_text = (
        f"🎉 <b>ЗАЯВКА НА БРОНИРОВАНИЕ №{res_code} ПРИНЯТА!</b>\n\n"
        f"👤 <b>Имя:</b> {data.get('res_name')}\n"
        f"📞 <b>Телефон:</b> {phone}\n"
        f"📅 <b>Дата:</b> {data.get('res_date')}\n"
        f"⏰ <b>Время:</b> {data.get('res_time')}\n"
        f"👥 <b>Количество гостей:</b> {data.get('res_guests')}\n"
        f"🏛 <b>Зона:</b> {data.get('res_zone')}\n\n"
        "━━━━━━━━━━━━━━━━━━━━\n"
        "Наш хостес свяжется с вами в ближайшее время для подтверждения брони.\n\n"
        "📍 <i>Ждём вас по адресу: г. Ташкент, Яшнабадский р-н, ул. Хуснабад, 5 проезд, Дом 1а</i>\n"
        "📞 <i>Телефоны для оперативной связи:</i>\n"
        "<b>97 185 00 10 • 97 185 00 20</b>"
    )
    
    await message.answer(res_text, parse_mode="HTML", reply_markup=main_reply_keyboard(is_admin=is_adm))
    
    # Notify staff & admins
    admin_alert = f"🔔 <b>НОВАЯ БРОНЬ СТОЛА В РЕСТОРАНЕ!</b>\n\n{res_text}"
    await notify_all_admins(message.bot, admin_alert)
    
    await state.clear()
