from datetime import datetime, timedelta
from aiogram.types import (
    ReplyKeyboardMarkup, KeyboardButton,
    InlineKeyboardMarkup, InlineKeyboardButton,
    WebAppInfo
)
from menu_data import MENU, ITEMS_BY_ID, format_price
from config import WEBSITE_URL, WEBAPP_URL

def is_valid_telegram_url(url: str) -> bool:
    if not url:
        return False
    u = url.strip().lower()
    if not (u.startswith("https://") or u.startswith("http://") or u.startswith("tg://")):
        return False
    if "localhost" in u or "127.0.0.1" in u:
        return False
    return True

def webapp_inline_button(text: str = "📱 Открыть приложение (Заказ & Бронь)") -> InlineKeyboardButton:
    target = WEBAPP_URL or WEBSITE_URL
    if is_valid_telegram_url(target):
        if target.startswith("https://"):
            return InlineKeyboardButton(text=text, web_app=WebAppInfo(url=target))
        return InlineKeyboardButton(text=text, url=target)
    return InlineKeyboardButton(text=text, callback_data="show_website_info")

def website_inline_button(text: str = "🌐 Наш официальный сайт") -> InlineKeyboardButton:
    if is_valid_telegram_url(WEBSITE_URL):
        if WEBSITE_URL.startswith("https://"):
            return InlineKeyboardButton(text=text, web_app=WebAppInfo(url=WEBSITE_URL))
        return InlineKeyboardButton(text=text, url=WEBSITE_URL)
    # If the URL is localhost / local IP, route to callback so Telegram Bot API does not reject it
    return InlineKeyboardButton(text=text, callback_data="show_website_info")

def main_reply_keyboard(is_admin: bool = False) -> ReplyKeyboardMarkup:
    target = WEBAPP_URL or WEBSITE_URL
    app_btn = (
        KeyboardButton(text="📱 Открыть приложение (Заказ & Бронь)", web_app=WebAppInfo(url=target))
        if (is_valid_telegram_url(target) and target.startswith("https://"))
        else KeyboardButton(text="📖 Меню ресторана")
    )
    kb = [
        [app_btn],
        [
            KeyboardButton(text="📖 Меню ресторана"),
            KeyboardButton(text="🛒 Корзина")
        ],
        [
            KeyboardButton(text="📅 Забронировать стол"),
            KeyboardButton(text="🛵 Оформить доставку")
        ],
        [
            KeyboardButton(text="🌐 Наш веб-сайт"),
            KeyboardButton(text="🔍 Поиск блюда")
        ],
        [
            KeyboardButton(text="📍 Локация и адрес"),
            KeyboardButton(text="📞 Контакты и соцсети")
        ],
        [
            KeyboardButton(text="📄 Скачать PDF-меню")
        ]
    ]
    if is_admin:
        kb.append([KeyboardButton(text="⚙️ Панель администратора")])
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)

def cuisines_inline_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [
            webapp_inline_button("📱 Открыть приложение (Заказ & Бронь)")
        ],
        [
            InlineKeyboardButton(text="🇪🇺 Европейская кухня", callback_data="sec:euro"),
            InlineKeyboardButton(text="🇰🇷 Корейская кухня", callback_data="sec:korea")
        ],
        [
            InlineKeyboardButton(text="🍢 Шашлыки & Мангал", callback_data="sec:grill"),
            InlineKeyboardButton(text="🍸 Барная карта & Коктейли", callback_data="sec:bar")
        ],
        [
            InlineKeyboardButton(text="📸 Просмотр страниц меню (1-8)", callback_data="menu_pages_list")
        ],
        [
            InlineKeyboardButton(text="🛒 Перейти в корзину", callback_data="open_cart"),
            InlineKeyboardButton(text="🔍 Поиск блюда", callback_data="search_dish")
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def categories_by_section_keyboard(section: str) -> InlineKeyboardMarkup:
    section_cats = [c for c in MENU["categories"] if c["section"] == section]
    buttons = []
    for cat in section_cats:
        buttons.append([InlineKeyboardButton(text=f"{cat['name']} ({len(cat['items'])})", callback_data=f"cat:{cat['id']}:0")])
    buttons.append([InlineKeyboardButton(text="⬅️ Назад ко всем кухням", callback_data="cuisines_menu")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def dishes_list_keyboard(category_id: str, page: int = 0, page_size: int = 6) -> InlineKeyboardMarkup:
    cat = next((c for c in MENU["categories"] if c["id"] == category_id), None)
    if not cat:
        return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="⬅️ Назад", callback_data="cuisines_menu")]])
    
    items = cat["items"]
    total_pages = max(1, (len(items) + page_size - 1) // page_size)
    page = max(0, min(page, total_pages - 1))
    
    start_idx = page * page_size
    page_items = items[start_idx:start_idx + page_size]
    
    buttons = []
    for item in page_items:
        title = f"{item['name']} • {format_price(item['price'])}"
        buttons.append([InlineKeyboardButton(text=title, callback_data=f"item:{item['id']}:{category_id}:{page}")])
        
    nav_buttons = []
    if page > 0:
        nav_buttons.append(InlineKeyboardButton(text="⬅️ Назад", callback_data=f"cat:{category_id}:{page - 1}"))
    nav_buttons.append(InlineKeyboardButton(text=f"{page + 1} / {total_pages}", callback_data="noop"))
    if page < total_pages - 1:
        nav_buttons.append(InlineKeyboardButton(text="Вперед ➡️", callback_data=f"cat:{category_id}:{page + 1}"))
    
    if len(nav_buttons) > 1:
        buttons.append(nav_buttons)
        
    buttons.append([
        InlineKeyboardButton(text="⬅️ К категориям", callback_data=f"sec:{cat['section']}"),
        InlineKeyboardButton(text="🛒 Корзина", callback_data="open_cart")
    ])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def dish_detail_keyboard(dish_id: str, cat_id: str, page: int, qty: int = 1) -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="➖", callback_data=f"qty_dec:{dish_id}:{cat_id}:{page}:{qty}"),
            InlineKeyboardButton(text=f"🔢 {qty} шт.", callback_data="noop"),
            InlineKeyboardButton(text="➕", callback_data=f"qty_inc:{dish_id}:{cat_id}:{page}:{qty}")
        ],
        [
            InlineKeyboardButton(text=f"🛒 Добавить в корзину ({qty} шт)", callback_data=f"add_cart:{dish_id}:{cat_id}:{page}:{qty}")
        ],
        [
            InlineKeyboardButton(text="⬅️ Назад к списку", callback_data=f"cat:{cat_id}:{page}"),
            InlineKeyboardButton(text="🛒 В корзину", callback_data="open_cart")
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def cart_keyboard(cart: dict) -> InlineKeyboardMarkup:
    buttons = []
    for dish_id, count in cart.items():
        item = ITEMS_BY_ID.get(dish_id)
        if not item:
            continue
        buttons.append([
            InlineKeyboardButton(
                text=f"{item['name']} × {count} = {format_price(item['price'] * count)}",
                callback_data=f"item:{dish_id}:{item.get('category_id', 'euro_snacks')}:0"
            )
        ])
        buttons.append([
            InlineKeyboardButton(text="➖", callback_data=f"cart_dec:{dish_id}"),
            InlineKeyboardButton(text=f"{count} шт", callback_data="noop"),
            InlineKeyboardButton(text="➕", callback_data=f"cart_inc:{dish_id}"),
            InlineKeyboardButton(text="🗑 Удалить", callback_data=f"cart_del:{dish_id}")
        ])
    
    buttons.append([
        InlineKeyboardButton(text="✅ Оформить заказ доставки", callback_data="checkout_start")
    ])
    buttons.append([
        InlineKeyboardButton(text="📖 Добавить ещё блюда", callback_data="cuisines_menu"),
        InlineKeyboardButton(text="🗑 Очистить корзину", callback_data="cart_clear")
    ])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def empty_cart_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📖 Открыть меню ресторана", callback_data="cuisines_menu")],
        [InlineKeyboardButton(text="🔍 Найти любимое блюдо", callback_data="search_dish")]
    ])

def reservation_date_keyboard() -> InlineKeyboardMarkup:
    today = datetime.now()
    tomorrow = today + timedelta(days=1)
    day_after = today + timedelta(days=2)
    
    def fmt(d):
        return d.strftime("%d.%m")
    
    buttons = [
        [
            InlineKeyboardButton(text=f"Сегодня ({fmt(today)})", callback_data=f"res_date:{today.strftime('%d.%m.%Y')}"),
            InlineKeyboardButton(text=f"Завтра ({fmt(tomorrow)})", callback_data=f"res_date:{tomorrow.strftime('%d.%m.%Y')}")
        ],
        [
            InlineKeyboardButton(text=f"Послезавтра ({fmt(day_after)})", callback_data=f"res_date:{day_after.strftime('%d.%m.%Y')}"),
            InlineKeyboardButton(text="✍️ Другая дата", callback_data="res_date:custom")
        ],
        [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_action")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def reservation_time_keyboard() -> InlineKeyboardMarkup:
    slots = ["12:00", "13:00", "14:00", "18:00", "19:00", "20:00", "21:00", "22:00"]
    buttons = []
    row = []
    for s in slots:
        row.append(InlineKeyboardButton(text=s, callback_data=f"res_time:{s}"))
        if len(row) == 4:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)
    buttons.append([
        InlineKeyboardButton(text="✍️ Другое время", callback_data="res_time:custom"),
        InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_action")
    ])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def reservation_guests_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="👤 1-2 человека", callback_data="res_guests:1-2 персоны"),
            InlineKeyboardButton(text="👥 3-4 человека", callback_data="res_guests:3-4 персоны")
        ],
        [
            InlineKeyboardButton(text="👨‍👩‍👧‍👦 5-6 человек", callback_data="res_guests:5-6 персон"),
            InlineKeyboardButton(text="🎉 7-10 человек", callback_data="res_guests:7-10 персон")
        ],
        [
            InlineKeyboardButton(text="👑 Банкет (10+ человек)", callback_data="res_guests:Банкет (10+)")
        ],
        [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_action")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def reservation_zone_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(text="🏛 Основной зал ресторана", callback_data="res_zone:Основной зал")],
        [InlineKeyboardButton(text="🍸 Барная зона / Коктейли", callback_data="res_zone:Барная зона")],
        [InlineKeyboardButton(text="🛋 Уютная кабинка / VIP", callback_data="res_zone:VIP-кабинка")],
        [InlineKeyboardButton(text="✨ Любое удобное место", callback_data="res_zone:Любой стол")],
        [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_action")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def share_phone_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📱 Отправить номер телефона", request_contact=True)],
            [KeyboardButton(text="❌ Отмена")]
        ],
        resize_keyboard=True,
        one_time_keyboard=True
    )

def share_location_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📍 Отправить геопозицию", request_location=True)],
            [KeyboardButton(text="❌ Отмена")]
        ],
        resize_keyboard=True,
        one_time_keyboard=True
    )

def order_payment_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="💳 Click", callback_data="pay:Click"),
            InlineKeyboardButton(text="💳 Payme", callback_data="pay:Payme")
        ],
        [
            InlineKeyboardButton(text="💵 Наличными курьеру", callback_data="pay:Наличные"),
            InlineKeyboardButton(text="💳 Картой курьеру (терминал)", callback_data="pay:Карта курьеру")
        ],
        [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_action")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def order_type_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="🛵 Доставка курьером", callback_data="ord_type:delivery"),
            InlineKeyboardButton(text="🛍 Самовывоз из ресторана", callback_data="ord_type:takeaway")
        ],
        [InlineKeyboardButton(text="❌ Отмена", callback_data="cancel_action")]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def contacts_inline_keyboard() -> InlineKeyboardMarkup:
    info = MENU["restaurant_info"]
    # DO NOT USE tel: IN INLINE BUTTONS (TELEGRAM CRASHES WITH BAD REQUEST)
    buttons = [
        [
            InlineKeyboardButton(text="📞 97 185 00 10 (позвонить)", callback_data="call_phone:1"),
            InlineKeyboardButton(text="📞 97 185 00 20 (позвонить)", callback_data="call_phone:2")
        ],
        [
            website_inline_button("🌐 Наш официальный сайт")
        ],
        [
            InlineKeyboardButton(text="📸 Instagram @fenix.tashkent", url=info["instagram"]),
            InlineKeyboardButton(text="📢 Telegram-канал", url=info["telegram_channel"])
        ],
        [
            InlineKeyboardButton(text="🗺 Открыть в Яндекс Картах", url=info["yandex_maps"]),
            InlineKeyboardButton(text="🗺 Google Maps", url=info["google_maps"])
        ],
        [
            InlineKeyboardButton(text="📍 Точка на карте в чат", callback_data="send_geo_card"),
            InlineKeyboardButton(text="📄 PDF-меню ресторана", callback_data="get_pdf_menu")
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def menu_pages_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="Стр. 1 (Закуски)", callback_data="page_view:1"),
            InlineKeyboardButton(text="Стр. 2 (Салаты/Супы)", callback_data="page_view:2"),
            InlineKeyboardButton(text="Стр. 3 (Стейки/Шашлык)", callback_data="page_view:3"),
            InlineKeyboardButton(text="Стр. 4 (Рыба/Мангал)", callback_data="page_view:4"),
        ],
        [
            InlineKeyboardButton(text="Стр. 5 (Корея)", callback_data="page_view:5"),
            InlineKeyboardButton(text="Стр. 6 (Корея супы)", callback_data="page_view:6"),
            InlineKeyboardButton(text="Стр. 7 (Самгепсаль)", callback_data="page_view:7"),
            InlineKeyboardButton(text="Стр. 8 (Бар)", callback_data="page_view:8"),
        ],
        [
            InlineKeyboardButton(text="📥 Скачать полный PDF (6 МБ)", callback_data="get_pdf_menu"),
            InlineKeyboardButton(text="⬅️ Назад к меню", callback_data="cuisines_menu")
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def admin_panel_keyboard() -> InlineKeyboardMarkup:
    buttons = [
        [
            InlineKeyboardButton(text="📋 Последние заказы", callback_data="adm:orders"),
            InlineKeyboardButton(text="📅 Последние брони", callback_data="adm:reservations")
        ],
        [
            InlineKeyboardButton(text="🎪 Заявки на банкеты", callback_data="adm:events"),
            InlineKeyboardButton(text="📊 Статистика", callback_data="adm:stats")
        ],
        [
            InlineKeyboardButton(text="🔄 Обновить данные", callback_data="adm:refresh")
        ]
    ]
    return InlineKeyboardMarkup(inline_keyboard=buttons)
