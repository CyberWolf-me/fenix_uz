from datetime import datetime
from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, FSInputFile, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext

from config import LOGO_AVATAR, WEBSITE_URL, BOT_ADMIN_PASSWORD, BOT_COURIER_PASSWORD
from keyboards import main_reply_keyboard, cuisines_inline_keyboard, admin_panel_keyboard, website_inline_button
import db
from utils import safe_edit_or_send

router = Router()

START_TEXT = (
    "Добро пожаловать в <b>FENIX RESTAURANT & BAR</b>! 🔥\n\n"
    "Мы рады приветствовать вас в нашем ресторанном пространстве в Ташкенте. "
    "У нас вы найдёте гармоничное сочетание богатых кулинарных традиций, "
    "авторской подачи и тёплой атмосферы:\n\n"
    "🍽 <b>Европейская кухня</b> — изысканные стейки, сочные салаты и пасты\n"
    "🥢 <b>Аутентичная корейская кухня</b> — токпокки, самгепсаль, пулькоги, кукси, рамён\n"
    "🍢 <b>Кавказские шашлыки & мангал</b> — отборное мясо на живых углях\n"
    "🍸 <b>Премиальный бар</b> — авторские коктейли, элитный алкоголь и винная карта\n"
    "🛵 <b>Быстрая доставка</b> и предварительный заказ банкетных сетов\n"
    "📅 <b>Удобное бронирование столиков</b> для отдыха и торжеств\n\n"
    "📍 <i>г. Ташкент, Яшнабадский район, ул. Хуснабад, 5 проезд, Дом 1а</i>\n"
    "📞 <b>97 185 00 10 • 97 185 00 20</b>\n"
    f"🌐 <b>Сайт:</b> {WEBSITE_URL}\n\n"
    "Выберите нужное действие в меню ниже или воспользуйтесь кнопками быстрого доступа:"
)

HELP_TEXT = (
    "<b>ℹ️ Справочная информация по боту FENIX:</b>\n\n"
    "📋 <b>Основные команды:</b>\n"
    "▫️ /start — Главное меню и перезапуск бота\n"
    "▫️ /menu — Интерактивное меню кухни и бара\n"
    "▫️ /cart — Моя корзина и оформление доставки\n"
    "▫️ /reserve — Забронировать столик в зале\n"
    "▫️ /site — Официальный интерактивный веб-сайт\n"
    "▫️ /location — Адрес и геолокация на карте\n"
    "▫️ /contacts — Номера телефонов и социальные сети\n"
    "▫️ /pdf — Скачать официальное меню ресторана\n"
    "▫️ /help — Данная справка\n\n"
    "📍 <b>Адрес:</b> г. Ташкент, Яшнабадский район, улица Хуснабад, 5 проезд, дом 1а\n"
    "⏰ <b>Время работы:</b> Ежедневно с 11:00 до 23:00\n"
    "📞 <b>Контакты для звонков:</b>\n"
    "+998 97 185 00 10\n"
    "+998 97 185 00 20\n"
    f"🌐 <b>Официальный сайт:</b> {WEBSITE_URL}\n"
    "📲 Instagram: @fenix.tashkent\n"
    "📢 Telegram-канал: @fenix_tashkent"
)

ADMIN_PASSWORD = BOT_ADMIN_PASSWORD

@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    is_adm = db.is_staff(message.from_user.id)
    reply_kb = main_reply_keyboard(is_admin=is_adm)
    inline_kb = cuisines_inline_keyboard()
    
    if LOGO_AVATAR.exists():
        photo = FSInputFile(str(LOGO_AVATAR))
        await message.answer_photo(
            photo=photo,
            caption=START_TEXT,
            parse_mode="HTML",
            reply_markup=inline_kb
        )
        await message.answer("Главная панель навигации активирована 👇", reply_markup=reply_kb)
    else:
        await message.answer(
            text=START_TEXT,
            parse_mode="HTML",
            reply_markup=inline_kb
        )
        await message.answer("Главная панель навигации активирована 👇", reply_markup=reply_kb)

@router.message(Command("help"))
async def cmd_help(message: Message):
    is_adm = db.is_staff(message.from_user.id)
    await message.answer(HELP_TEXT, parse_mode="HTML", reply_markup=main_reply_keyboard(is_admin=is_adm))

@router.message(F.text == "🌐 Наш веб-сайт")
@router.message(Command("site"))
@router.message(Command("website"))
async def cmd_website(message: Message):
    text = (
        "🌐 <b>ОФИЦИАЛЬНЫЙ ВЕБ-САЙТ FENIX RESTAURANT & BAR</b>\n\n"
        "Приглашаем вас посетить наш современный интерактивный веб-сайт:\n\n"
        "✨ <b>Возможности сайта:</b>\n"
        "• <b>Полное меню кухни и бара:</b> 184 позиции с фото, ценами и фильтрами по кухням (Европа, Корея, Мангал, Бар)\n"
        "• <b>Онлайн-бронирование столиков:</b> выбор даты (до 60 дней), удобных тайм-слотов и залов\n"
        "• <b>Заявки на банкеты и торжества:</b> 1-й этаж (120 гостей), 2-й этаж (170 гостей)\n"
        "• <b>Корзина и оформление доставки</b>\n"
        "• <b>Мультиязычность:</b> Русский, O'zbek, English\n"
        "• <b>Галерея блюд и интерьера</b>\n\n"
        f"🔗 <b>Прямой адрес сайта:</b> {WEBSITE_URL}"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [website_inline_button("🌐 Открыть сайт FENIX")],
        [InlineKeyboardButton(text="⬅️ Назад к меню", callback_data="cuisines_menu")]
    ])
    await message.answer(text, parse_mode="HTML", reply_markup=kb)

@router.callback_query(F.data == "show_website_info")
async def callback_show_website_info(callback: CallbackQuery):
    await callback.answer()
    text = (
        "🌐 <b>ОФИЦИАЛЬНЫЙ ВЕБ-САЙТ FENIX RESTAURANT & BAR</b>\n\n"
        "Интерактивный веб-сайт с полным каталогом блюд, фото и онлайн-бронированием:\n\n"
        f"🔗 <b>Адрес сайта:</b> <code>{WEBSITE_URL}</code>\n\n"
        "Скопируйте ссылку и откройте её в браузере вашего смартфона или компьютера!"
    )
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⬅️ Назад к меню", callback_data="cuisines_menu")]
    ])
    await safe_edit_or_send(callback, text, reply_markup=kb)

@router.callback_query(F.data == "cancel_action")
async def callback_cancel(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await callback.answer("Действие отменено.")
    await safe_edit_or_send(
        callback,
        "Операция отменена. Вы вернулись в главное меню.",
        reply_markup=cuisines_inline_keyboard()
    )

# Admin authentication & panel
@router.message(Command("admin"))
@router.message(F.text == "⚙️ Панель администратора")
async def cmd_admin(message: Message):
    user_id = message.from_user.id
    parts = message.text.split() if message.text else []
    
    if len(parts) > 1 and parts[1].strip() in (ADMIN_PASSWORD, "fenix"):
        db.register_staff(user_id, message.from_user.username or "", message.from_user.full_name or "")
        await message.answer(
            "✅ <b>Авторизация успешна!</b>\nВы зарегистрированы как сотрудник ресторана Fenix.\n"
            "Теперь вы будете получать уведомления обо всех новых заказах и бронированиях столов в реальном времени.",
            parse_mode="HTML",
            reply_markup=main_reply_keyboard(is_admin=True)
        )
        await message.answer("Панель управления персоналом:", reply_markup=admin_panel_keyboard())
        return
        
    if db.is_staff(user_id):
        stats = db.get_stats()
        text = (
            "⚙️ <b>Панель администратора FENIX</b>\n\n"
            f"📦 Всего заказов: <b>{stats['total_orders']}</b>\n"
            f"💰 Общая выручка: <b>{stats['total_revenue']:,} сум</b>\n".replace(",", " ") +
            f"📅 Всего броней столов: <b>{stats['total_reservations']}</b>\n"
            f"🎪 Всего заявок на банкеты: <b>{stats.get('total_events', 0)}</b>\n\n"
            "Выберите раздел для просмотра:"
        )
        await message.answer(text, parse_mode="HTML", reply_markup=admin_panel_keyboard())
    else:
        await message.answer(
            "🔒 <b>Вход для персонала Fenix:</b>\n\n"
            "Для авторизации отправьте команду с паролем: <code>/admin fenix</code>",
            parse_mode="HTML"
        )

@router.callback_query(F.data.startswith("adm:"))
async def callback_admin_actions(callback: CallbackQuery):
    user_id = callback.from_user.id
    if not db.is_staff(user_id):
        await callback.answer("У вас нет доступа к этой панели.", show_alert=True)
        return
        
    action = callback.data.split(":")[1]
    
    if action == "orders":
        orders = db.get_recent_orders(5)
        if not orders:
            await callback.answer("Заказов пока нет", show_alert=True)
            return
        lines = ["📋 <b>Последние 5 заказов:</b>\n"]
        for o in orders:
            lines.append(
                f"▫️ <b>Заказ №{o['order_num']}</b> ({o['created_at'][:16]})\n"
                f"   Клиент: {o['customer_name']} ({o['customer_phone']})\n"
                f"   Тип: {o['order_type']}\n"
                f"   Сумма: <b>{o['total_price']:,} сум</b>\n".replace(",", " ") +
                f"   Статус: {o['status']}\n"
            )
        await safe_edit_or_send(callback, "\n".join(lines), reply_markup=admin_panel_keyboard())
        await callback.answer()
        
    elif action == "reservations":
        res_list = db.get_recent_reservations(5)
        if not res_list:
            await callback.answer("Броней пока нет", show_alert=True)
            return
        lines = ["📅 <b>Последние 5 броней столов:</b>\n"]
        for r in res_list:
            lines.append(
                f"▫️ <b>Бронь №{r['code']}</b> ({r['created_at'][:16]})\n"
                f"   Гость: {r['customer_name']} ({r['customer_phone']})\n"
                f"   Дата и время: <b>{r['res_date']} в {r['res_time']}</b>\n"
                f"   Персоны: {r['guests']} | Зона: {r['zone']}\n"
                f"   Статус: {r['status']}\n"
            )
        await safe_edit_or_send(callback, "\n".join(lines), reply_markup=admin_panel_keyboard())
        await callback.answer()

    elif action == "events":
        events_list = db.get_recent_events(5)
        if not events_list:
            await callback.answer("Заявок на банкеты пока нет", show_alert=True)
            return
        lines = ["🎪 <b>Последние 5 заявок на банкеты (с сайта):</b>\n"]
        for ev in events_list:
            lines.append(
                f"▫️ <b>Заявка #{ev.get('event_id', ev['id'])}</b> ({ev['created_at'][:16]})\n"
                f"   Клиент: {ev['customer_name']} ({ev['customer_phone']})\n"
                f"   Событие: {ev['event_type']} | Зал: {ev['hall']}\n"
                f"   Гостей: {ev['guests']} | Дата: {ev['event_date']}\n"
                f"   Статус: {ev['status']}\n"
            )
        await safe_edit_or_send(callback, "\n".join(lines), reply_markup=admin_panel_keyboard())
        await callback.answer()
        
    elif action in ("stats", "refresh"):
        stats = db.get_stats()
        text = (
            "⚙️ <b>Панель администратора FENIX</b>\n\n"
            f"📦 Всего заказов: <b>{stats['total_orders']}</b>\n"
            f"💰 Общая выручка: <b>{stats['total_revenue']:,} сум</b>\n".replace(",", " ") +
            f"📅 Всего броней столов: <b>{stats['total_reservations']}</b>\n"
            f"🎪 Всего заявок на банкеты: <b>{stats.get('total_events', 0)}</b>\n\n"
            "Данные обновлены."
        )
        await safe_edit_or_send(callback, text, reply_markup=admin_panel_keyboard())
        await callback.answer("Обновлено")

# ── Option 3: Telegram Courier Group Dispatch & Claim Fulfillment ───
@router.message(Command("set_courier_group"))
async def cmd_set_courier_group(message: Message):
    if message.chat.type not in ("group", "supergroup"):
        await message.answer(
            "⚠️ Команду <code>/set_courier_group</code> необходимо отправлять <b>внутри вашей группы курьеров</b> в Telegram.\n\n"
            "1. Создайте группу в Telegram (например, <i>«FENIX — Курьеры & Доставка»</i>).\n"
            "2. Добавьте в неё бота @FenixRestaurantBot.\n"
            "3. Отправьте в группе команду <code>/set_courier_group</code>.",
            parse_mode="HTML"
        )
        return

    chat_id = message.chat.id
    chat_title = message.chat.title or "Группа курьеров FENIX"
    db.set_setting("courier_group_id", str(chat_id))
    db.set_setting("courier_group_title", chat_title)

    await message.answer(
        "✅ <b>ГРУППА КУРЬЕРОВ УСПЕШНО ПРИВЯЗАНА!</b>\n\n"
        f"🏷 <b>Название:</b> {chat_title}\n"
        f"🆔 <b>Chat ID:</b> <code>{chat_id}</code>\n\n"
        "📦 Теперь все заказы на доставку при передаче курьеру (статус <i>«В пути»</i>) "
        "будут мгновенно поступать в этот чат с кнопкой <b>[ 🙋‍♂️ Взять заказ ]</b>.\n\n"
        "🛵 <b>Как работает доставка через группу:</b>\n"
        "1. В чат поступает карточка заказа со списком блюд, адресом, суммой и маршрутом.\n"
        "2. Свободный водитель нажимает <b>«🙋‍♂️ Взять заказ»</b> — карточка закрепляется за ним.\n"
        "3. В сообщении появляется кнопка <b>«✅ Заказ доставлен клиенту»</b>.\n"
        "4. После вручения курьер подтверждает доставку, и статус заказа в системе автоматически меняется на «Выполнен».",
        parse_mode="HTML"
    )

@router.callback_query(F.data.startswith("courier_claim:"))
async def callback_courier_claim(callback: CallbackQuery):
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
    # Extract existing yandex maps URL from reply_markup
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

@router.callback_query(F.data.startswith("courier_delivered:"))
async def callback_courier_delivered(callback: CallbackQuery):
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
