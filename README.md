# FENIX Restobar & Lounge

> Веб-сайт, Telegram Mini App, Telegram-бот и диспетчерская операционная система (Admin OS) для ресторана и бара **FENIX** (Ташкент).

---

## 📁 Структура проекта (Architecture)

```text
menu/
├── bot/                         # 🤖 Telegram-бот (@FenixRestaurantBot)
│   ├── bot.py                   # Точка входа бота (aiogram 3.x)
│   ├── config.py                # Конфигурация токенов и ссылок WebApp
│   ├── db.py                    # Модуль работы с SQLite
│   ├── handlers/                # Маршрутизаторы и обработчики команд
│   ├── fenix_restaurant.db      # Общая база данных заказов и бронирований
│   ├── img/                     # Сжатые превью блюд для сообщений бота
│   ├── menu_pages/              # Страницы меню для каталога
│   └── requirements.txt         # Зависимости Python
│
├── fenix-restobar-website/      # 🌐 Веб-сайт, Mini App и Диспетчерская
│   ├── index.html               # Основной сайт ресторана
│   ├── app.html                 # Telegram Mini App
│   ├── admin.html               # Диспетчерская OS FENIX (Admin Console)
│   ├── src/                     # React / JSX компоненты админ-панели
│   ├── server/                  # Node.js backend API
│   │   └── server.mjs           # HTTP/API сервер с доступом к fenix_restaurant.db
│   ├── css/                     # Стили веб-сайта
│   ├── js/                      # Логика и каталог веб-сайта
│   └── img/                     # Оптимизированные веб-изображения (WebP/SVG)
│
├── raw_design_assets/           # 🎨 Исходные полиграфические материалы (ignored by Git)
│   ├── EPS/PDF исходники печати (меню, визитки)
│   ├── Исходные фотографии блюд и залов
│   └── Архивы референсов
│
├── run_all.bat                  # 🚀 Скрипт запуска веб-сервера и бота в 1 клик
└── .gitignore                   # Правила исключения тяжёлых бинарников из Git
```

---

## 🚀 Быстрый запуск (Quick Start)

### 1. Веб-сервер и админ-панель (Node.js)
```bash
cd fenix-restobar-website
node server/server.mjs
```
- Веб-сайт: [http://localhost:3000](http://localhost:3000)
- Диспетчерская (Admin OS): [http://localhost:3000/admin](http://localhost:3000/admin)

### 2. Telegram-бот (Python)
```bash
cd bot
pip install -r requirements.txt
python bot.py
```

### 3. Запуск всего в один клик (Windows)
Просто запустите файл `run_all.bat`.
