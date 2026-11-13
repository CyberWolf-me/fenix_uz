from pathlib import Path
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, FSInputFile
from aiogram.filters import Command

from config import BASE_DIR, MENU_PAGES_DIR
from menu_data import MENU, ITEMS_BY_ID, format_price
from keyboards import (
    cuisines_inline_keyboard,
    categories_by_section_keyboard,
    dishes_list_keyboard,
    dish_detail_keyboard,
    menu_pages_keyboard
)
from utils import safe_edit_or_send
import db

router = Router()

SECTION_TITLES = {
    "euro": "🇪🇺 <b>Европейская кухня FENIX</b>\nВыберите категорию блюд:",
    "korea": "🇰🇷 <b>Традиционная корейская кухня FENIX</b>\nВыберите категорию блюд:",
    "grill": "🍢 <b>Кавказские шашлыки, рыба и мангал</b>\nВыберите категорию блюд:",
    "bar": "🍸 <b>Барная карта, алкоголь и напитки</b>\nВыберите категорию:"
}

@router.message(F.text == "📖 Меню ресторана")
@router.message(Command("menu"))
async def show_cuisines_menu(message: Message):
    text = (
        "🍽 <b>Меню FENIX RESTAURANT & BAR</b>\n\n"
        "Мы собрали для вас лучшие блюда европейской и аутентичной корейской кухни, "
        "шашлыки на мангале и богатую барную карту.\n\n"
        "Выберите интересующий раздел:"
    )
    await message.answer(text, parse_mode="HTML", reply_markup=cuisines_inline_keyboard())

@router.callback_query(F.data == "cuisines_menu")
async def callback_cuisines_menu(callback: CallbackQuery):
    text = (
        "🍽 <b>Меню FENIX RESTAURANT & BAR</b>\n\n"
        "Выберите раздел кухни или барной карты:"
    )
    await safe_edit_or_send(callback, text, reply_markup=cuisines_inline_keyboard())
    await callback.answer()

@router.callback_query(F.data.startswith("sec:"))
async def callback_section(callback: CallbackQuery):
    section = callback.data.split(":")[1]
    title = SECTION_TITLES.get(section, "Выберите категорию блюд:")
    kb = categories_by_section_keyboard(section)
    await safe_edit_or_send(callback, title, reply_markup=kb)
    await callback.answer()

@router.callback_query(F.data.startswith("cat:"))
async def callback_category(callback: CallbackQuery):
    parts = callback.data.split(":")
    cat_id = parts[1]
    page = int(parts[2]) if len(parts) > 2 else 0
    
    cat = next((c for c in MENU["categories"] if c["id"] == cat_id), None)
    if not cat:
        await callback.answer("Категория не найдена", show_alert=True)
        return
        
    text = (
        f"<b>{cat['name']}</b>\n"
        f"Всего позиций: {len(cat['items'])}\n\n"
        f"Нажмите на любое блюдо для подробной информации, просмотра фото и добавления в корзину:"
    )
    kb = dishes_list_keyboard(cat_id, page=page)
    await safe_edit_or_send(callback, text, reply_markup=kb)
    await callback.answer()

@router.callback_query(F.data.startswith("item:"))
async def callback_item_detail(callback: CallbackQuery):
    parts = callback.data.split(":")
    dish_id = parts[1]
    cat_id = parts[2]
    page = int(parts[3])
    
    item = ITEMS_BY_ID.get(dish_id)
    if not item:
        await callback.answer("Блюдо не найдено", show_alert=True)
        return
        
    stoplist = db.get_stoplist()
    is_stopped = item["name"] in stoplist
    stop_note = "\n\n⛔ <b>Внимание: данное блюдо сейчас в стоп-листе кухни (закончилось).</b>" if is_stopped else ""

    preorder_note = ""
    if "Предзаказ" in item["name"]:
        preorder_note = "\n\n⚠️ <i>Обратите внимание: это банкетное ассорти готовится по предварительному заказу.</i>"
        
    text = (
        f"🍴 <b>{item['name']}</b>\n\n"
        f"💵 <b>Цена:</b> {format_price(item['price'])}\n"
        f"⚖️ <b>Порция:</b> {item.get('unit', 'порция')}\n\n"
        f"📝 <b>Описание:</b>\n<i>{item.get('desc', 'Традиционное блюдо ресторана Fenix')}</i>"
        f"{preorder_note}{stop_note}\n\n"
        f"Категория: {item.get('category_name', '')}"
    )
    
    kb = dish_detail_keyboard(dish_id, cat_id, page, qty=1, is_stopped=is_stopped)
    
    # Check if dish has a photo
    img_rel = item.get("img")
    img_path = (BASE_DIR / img_rel) if img_rel else None
    
    if img_path and img_path.exists():
        try:
            await callback.message.delete()
        except Exception:
            pass
        await callback.message.answer_photo(
            photo=FSInputFile(str(img_path)),
            caption=text,
            parse_mode="HTML",
            reply_markup=kb
        )
    else:
        await safe_edit_or_send(callback, text, reply_markup=kb)
            
    await callback.answer()

@router.callback_query(F.data.startswith("qty_inc:"))
@router.callback_query(F.data.startswith("qty_dec:"))
async def callback_qty_change(callback: CallbackQuery):
    is_inc = callback.data.startswith("qty_inc:")
    parts = callback.data.split(":")
    dish_id = parts[1]
    cat_id = parts[2]
    page = int(parts[3])
    qty = int(parts[4])
    
    if is_inc:
        qty = min(50, qty + 1)
    else:
        qty = max(1, qty - 1)
        
    kb = dish_detail_keyboard(dish_id, cat_id, page, qty=qty)
    try:
        await callback.message.edit_reply_markup(reply_markup=kb)
    except Exception:
        pass
    await callback.answer()

@router.callback_query(F.data.startswith("add_cart:"))
async def callback_add_to_cart(callback: CallbackQuery):
    parts = callback.data.split(":")
    dish_id = parts[1]
    cat_id = parts[2]
    page = int(parts[3])
    qty = int(parts[4])
    
    item = ITEMS_BY_ID.get(dish_id)
    if not item:
        await callback.answer("Ошибка: блюдо не найдено", show_alert=True)
        return
        
    if item["name"] in db.get_stoplist():
        await callback.answer("⛔ Это блюдо сейчас в стоп-листе кухни и временно недоступно для заказа.", show_alert=True)
        return

    user_id = callback.from_user.id
    cart = db.get_user_cart(user_id)
    cart[dish_id] = cart.get(dish_id, 0) + qty
    db.save_user_cart(user_id, cart)
    
    total_qty = cart[dish_id]
    await callback.answer(f"✅ Добавлено: {item['name']} ({qty} шт.)\nВсего в корзине: {total_qty} шт.", show_alert=True)

@router.callback_query(F.data == "menu_pages_list")
async def callback_menu_pages(callback: CallbackQuery):
    text = (
        "📄 <b>Оригинальные страницы меню FENIX</b>\n\n"
        "Вы можете просмотреть дизайн и верстку любого разворота нашего печатного меню "
        "или скачать весь файл меню в формате PDF:"
    )
    kb = menu_pages_keyboard()
    await safe_edit_or_send(callback, text, reply_markup=kb)
    await callback.answer()

@router.callback_query(F.data.startswith("page_view:"))
async def callback_page_view(callback: CallbackQuery):
    page_num = callback.data.split(":")[1]
    page_img = MENU_PAGES_DIR / f"page_{page_num}.jpg"
    
    if not page_img.exists():
        await callback.answer(f"Страница {page_num} не найдена", show_alert=True)
        return
        
    await callback.answer(f"Загрузка страницы {page_num}...")
    await callback.message.answer_photo(
        photo=FSInputFile(str(page_img)),
        caption=f"📄 <b>Страница {page_num} меню Fenix Restaurant & Bar</b>",
        parse_mode="HTML",
        reply_markup=menu_pages_keyboard()
    )

@router.callback_query(F.data == "noop")
async def callback_noop(callback: CallbackQuery):
    await callback.answer()
