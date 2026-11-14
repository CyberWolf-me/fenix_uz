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

---

## Автоматическое резервное копирование SQLite (Database Backups)

Для обеспечения непрерывности данных и защиты от сбоев предусмотрен скрипт горячего резервного копирования `scripts/backup_db.sh`, использующий встроенную команду SQLite `.backup` (полностью безопасную для WAL-режима) с автоматической очисткой архивов старше 14 дней.

### Настройка через Cron

Сделайте скрипт исполняемым и добавьте задачу в crontab:
```bash
chmod +x /var/www/fenix/scripts/backup_db.sh
sudo crontab -e
```
Добавьте строку для ежедневного запуска в 04:00:
```text
0 4 * * * /var/www/fenix/scripts/backup_db.sh >> /var/log/fenix_backup.log 2>&1
```

### Альтернативная настройка через Systemd Timer

1. Создайте сервис `/etc/systemd/system/fenix-backup.service`:
```ini
[Unit]
Description=FENIX SQLite Database Backup
After=network.target

[Service]
Type=oneshot
User=root
ExecStart=/var/www/fenix/scripts/backup_db.sh
StandardOutput=journal
StandardError=journal
```

2. Создайте таймер `/etc/systemd/system/fenix-backup.timer`:
```ini
[Unit]
Description=Daily FENIX SQLite Database Backup Timer

[Timer]
OnCalendar=*-*-* 04:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

3. Активируйте таймер:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now fenix-backup.timer
sudo systemctl list-timers --all
```

---

## Сборка Admin OS (Build Step)

Admin OS диспетчерской скомпилирована в легковесный автономный бандл `fenix-restobar-website/dist/admin.bundle.js` с помощью `esbuild`. При внесении изменений в JSX-компоненты запустите:
```bash
node scripts/build_admin.mjs
```

