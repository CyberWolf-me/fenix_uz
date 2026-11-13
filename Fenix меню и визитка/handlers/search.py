from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext

from states import SearchState
from menu_data import MENU, format_price
from keyboards import cuisines_inline_keyboard, main_reply_keyboard
import db

router = Router()

def search_menu_items(query: str):
    q = query.strip().lower()
    results = []
    for cat in MENU["categories"]:
        for item in cat["items"]:
            name = item["name"].lower()
            desc = item.get("desc", "").lower()
            cat_name = cat["name"].lower()
            if q in name or q in desc or q in cat_name:
                results.append((item, cat["id"]))
    return results

@router.message(F.text == "🔍 Поиск блюда")
@router.callback_query(F.data == "search_dish")
async def start_search(event: Message | CallbackQuery, state: FSMContext):
    await state.set_state(SearchState.waiting_for_query)
    text = (
        "🔍 <b>Поиск блюд в меню FENIX</b>\n\n"
        "Напишите название блюда или ингредиента (например: <i>стейк, цезарь, шашлык, кукси, рамён, креветки, самгепсаль</i>):"
    )
    if isinstance(event, CallbackQuery):
        await event.answer()
        await event.message.answer(text, parse_mode="HTML")
    else:
        await event.answer(text, parse_mode="HTML")

@router.message(SearchState.waiting_for_query)
async def process_search_query(message: Message, state: FSMContext):
    query = message.text.strip()
    await state.clear()
    
    if len(query) < 2:
        is_adm = db.is_staff(message.from_user.id)
        await message.answer("Слишком короткий поисковый запрос. Попробуйте еще раз:", reply_markup=main_reply_keyboard(is_admin=is_adm))
        return
        
    results = search_menu_items(query)
    is_adm = db.is_staff(message.from_user.id)
    
    if not results:
        text = (
            f"🔍 По запросу «<b>{query}</b>» ничего не найдено.\n\n"
            "Попробуйте другое название или откройте полное меню кухни:"
        )
        await message.answer(text, parse_mode="HTML", reply_markup=cuisines_inline_keyboard())
        return
        
    shown = results[:15]
    text = (
        f"🔍 <b>Результаты поиска по запросу «{query}»:</b>\n"
        f"Найдено позиций: <b>{len(results)}</b>\n\n"
        f"Нажмите на блюдо для подробностей и добавления в корзину 👇"
    )
    buttons = []
    for item, cat_id in shown:
        btn_text = f"{item['name']} • {format_price(item['price'])}"
        buttons.append([InlineKeyboardButton(text=btn_text, callback_data=f"item:{item['id']}:{cat_id}:0")])
        
    buttons.append([
        InlineKeyboardButton(text="🔍 Искать снова", callback_data="search_dish"),
        InlineKeyboardButton(text="📖 Меню кухни", callback_data="cuisines_menu")
    ])
    
    await message.answer(text, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))

# Fallback smart text search handler for any unrecognized user message
@router.message(F.text)
async def fallback_text_search(message: Message, state: FSMContext):
    # If user is in a state, don't intercept
    current_state = await state.get_state()
    if current_state:
        return
        
    text = message.text.strip()
    lower = text.lower()
    is_adm = db.is_staff(message.from_user.id)
    
    # Greetings
    greetings = ["привет", "салам", "здравствуйте", "добрый день", "добрый вечер", "доброе утро", "хай", "hello", "hi"]
    if any(g in lower for g in greetings):
        await message.answer(
            f"Здравствуйте, {message.from_user.first_name}! 👋\n"
            "Рады приветствовать вас в FENIX RESTAURANT & BAR.\n"
            "Чем можем вам помочь? Выберите действие в меню ниже или напишите название блюда для поиска:",
            reply_markup=main_reply_keyboard(is_admin=is_adm)
        )
        return
        
    # Check if text matches dishes in menu
    results = search_menu_items(text)
    if results:
        shown = results[:10]
        caption = (
            f"🔍 Вы написали: «<b>{text}</b>»\n"
            f"Мы нашли подходящие блюда в нашем меню ({len(results)} шт.):\n\n"
            f"Нажмите на блюдо, чтобы узнать подробности и добавить в заказ 👇"
        )
        buttons = []
        for item, cat_id in shown:
            btn_text = f"{item['name']} • {format_price(item['price'])}"
            buttons.append([InlineKeyboardButton(text=btn_text, callback_data=f"item:{item['id']}:{cat_id}:0")])
            
        buttons.append([
            InlineKeyboardButton(text="📖 Все меню", callback_data="cuisines_menu"),
            InlineKeyboardButton(text="🛒 Корзина", callback_data="open_cart")
        ])
        await message.answer(caption, parse_mode="HTML", reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))
        return

    # Default fallback
    await message.answer(
        f"Вы написали: «{text}»\n\n"
        "Пожалуйста, воспользуйтесь кнопками меню ниже, чтобы забронировать столик, заказать доставку или изучить блюда:",
        reply_markup=main_reply_keyboard(is_admin=is_adm)
    )
