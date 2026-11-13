from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, FSInputFile
from aiogram.filters import Command

from config import MENU_PDF_LIGHT
from menu_data import MENU
from keyboards import contacts_inline_keyboard

router = Router()

LOCATION_TEXT = (
    "📍 <b>ЛОКАЦИЯ И АДРЕС FENIX RESTAURANT & BAR</b>\n\n"
    "🏛 <b>Адрес:</b>\n"
    "г. Ташкент, Яшнабадский район, улица Хуснабад, 5 проезд, Дом 1а\n\n"
    "⏰ <b>Режим работы:</b>\n"
    "Ежедневно с 11:00 до 23:00\n\n"
    "📞 <b>Бронь и доставка:</b>\n"
    "▫️ <b>+998 97 185 00 10</b>\n"
    "▫️ <b>+998 97 185 00 20</b>\n\n"
    "Ниже отправлена точная геопозиция на карте Ташкента для навигатора 👇"
)

CONTACTS_TEXT = (
    "📞 <b>КОНТАКТЫ И СОЦИАЛЬНЫЕ СЕТИ FENIX</b>\n\n"
    "🔥 <b>FENIX RESTAURANT & BAR</b> — пространство вашего идеального отдыха!\n\n"
    "📲 <b>Телефоны администратора / доставки:</b>\n"
    "▫️ <b>+998 97 185 00 10</b>\n"
    "▫️ <b>+998 97 185 00 20</b>\n\n"
    "📸 <b>Instagram:</b> @fenix.tashkent\n"
    "📢 <b>Telegram канал:</b> @fenix_tashkent\n\n"
    "📍 <b>Локация:</b> г. Ташкент, Яшнабадский район, ул. Хуснабад, 5 проезд, 1а\n\n"
    "Нажмите на кнопку ниже, чтобы получить визитку для звонка или открыть карту:"
)

@router.message(F.text == "📍 Локация и адрес")
@router.message(Command("location"))
async def show_location(message: Message):
    info = MENU["restaurant_info"]
    await message.answer(LOCATION_TEXT, parse_mode="HTML", reply_markup=contacts_inline_keyboard())
    # Send native Telegram location
    await message.answer_location(
        latitude=info["latitude"],
        longitude=info["longitude"]
    )

@router.callback_query(F.data == "send_geo_card")
async def callback_send_geo(callback: CallbackQuery):
    info = MENU["restaurant_info"]
    await callback.answer()
    await callback.message.answer_location(
        latitude=info["latitude"],
        longitude=info["longitude"]
    )

@router.message(F.text == "📞 Контакты и соцсети")
@router.message(Command("contacts"))
async def show_contacts(message: Message):
    await message.answer(CONTACTS_TEXT, parse_mode="HTML", reply_markup=contacts_inline_keyboard())

@router.callback_query(F.data.startswith("call_phone:"))
async def callback_call_phone(callback: CallbackQuery):
    phone_id = callback.data.split(":")[1]
    if phone_id == "1":
        num = "+998971850010"
        display = "+998 97 185 00 10"
    else:
        num = "+998971850020"
        display = "+998 97 185 00 20"
        
    await callback.answer(f"📞 Телефон для звонка: {display}", show_alert=True)
    # Send contact card for one-touch dialing on smartphone
    await callback.message.answer_contact(
        phone_number=num,
        first_name="FENIX Restaurant",
        last_name=f"& Bar ({display})"
    )

@router.message(F.text == "📄 Скачать PDF-меню")
@router.message(Command("pdf"))
@router.callback_query(F.data == "get_pdf_menu")
async def send_pdf_menu(event: Message | CallbackQuery):
    if isinstance(event, CallbackQuery):
        message = event.message
        await event.answer("Отправка PDF-меню...")
    else:
        message = event

    if MENU_PDF_LIGHT.exists():
        await message.answer_document(
            document=FSInputFile(str(MENU_PDF_LIGHT), filename="Fenix_Restaurant_Menu.pdf"),
            caption=(
                "📄 <b>Официальное меню FENIX RESTAURANT & BAR (PDF)</b>\n\n"
                "Все 8 страниц меню в высоком полиграфическом качестве:\n"
                "• Европейская и Корейская кухни\n"
                "• Шашлыки и блюда на мангале\n"
                "• Барная карта и авторские коктейли\n\n"
                "📞 Заказ и бронь: <b>97 185 00 10 • 97 185 00 20</b>"
            ),
            parse_mode="HTML"
        )
    else:
        await message.answer("Файл меню временно недоступен. Вы можете просмотреть меню интерактивно по кнопке «Меню ресторана».")
