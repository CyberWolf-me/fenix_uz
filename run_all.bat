@echo off
chcp 65001 > nul
title FENIX Restobar - Unified Server & Telegram Bot Launcher
echo ====================================================================
echo   🔥 FENIX RESTAURANT & BAR — ЗАПУСК ВЕБ-САЙТА И TELEGRAM-БОТА
echo ====================================================================
echo.
echo   [1] Запуск Node.js веб-сервера (http://localhost:3000)...
start "FENIX Website Server (Port 3000)" cmd /k "cd /d %~dp0fenix-restobar-website && node server/server.mjs"

echo   [2] Запуск Telegram-бота (@Fenix_restaurant_bot)...
start "FENIX Telegram Bot" cmd /k "cd /d %~dp0Fenix меню и визитка && python bot.py"

echo.
echo ====================================================================
echo   ✅ Сервер сайта и Telegram-бот запущены в отдельных окнах!
echo   🌐 Веб-сайт: http://localhost:3000
echo   🤖 Telegram-бот: https://t.me/Fenix_restaurant_bot
echo ====================================================================
echo.
pause
