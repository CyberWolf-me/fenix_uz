# FENIX Restobar — Complete Website Package (with Telegram Bot Bridge)

Built in strict compliance with **Fenix Restobar — Website Build Brief (v0.1)** and fully connected to the **FENIX Telegram Bot (@Fenix_restaurant_bot)**.

## What Is Included
1. **Pages (`index.html`, `menu.html`, `events.html`, `gallery.html`, `contact.html`, `privacy.html`, `style-guide.html`):**
   - Mobile-first (`390px` 4-col -> `768px` -> `1440px` 12-col, `1200px` max-width), WCAG 2.2 AA contrast (`16:1` ink, `5.4:1` dim text, `6.6:1` accent), `>= 44px` tap targets.
   - Trilingual (`RU / UZ / EN`) switcher with `<html lang>`, `hreflang` links, `localStorage` persistence, and Russian fallback logging.
   - **Telegram WebApp / Mini App support:** Built-in SDK script `<script src="https://telegram.org/js/telegram-web-app.js"></script>` that automatically expands in Telegram, pre-fills user details, and provides haptic feedback.
   - **Integrated Bot CTAs:** Quick-access buttons and badges to launch `@Fenix_restaurant_bot` from hero section, navigation bar, menu page, contacts, and checkout drawer.
2. **Full Interactive Menu (`data/menu.js` + `assets/menu/1.webp`–`30.webp`):**
   - All **184 real items** from the owner's menu PDF formatted in `so'm` (`285 000 so'm`) with live search, cuisine tabs, sticky category chips, and all 30 real WebP food cutout photos bundled.
3. **Reservation, Banquet & Pickup/Delivery System (`js/app.js` + `server/server.mjs`):**
   - **Table Reservation Form (Section 7.1):** Date (today to +60 days), 30-min time slots handling Fri/Sat `02:00` next-day close, 1–12 guests (`>12` guests auto-routes to Events Inquiry), `+998` 9-digit mask, honeypot, rate-limiting, and tap-to-call failure fallback.
   - **Event & Banquet Inquiry Form (Section 7.2):** Event types, 1st floor (120) / 2nd floor (170) hall choice, validation, and staff routing.
   - **Pickup & Delivery Order Drawer (Section 7.8 Scaffold):** Interactive cart & checkout drawer with explicit `[[OWNER: ...]]` placeholders for delivery fees, zones, minimum order, and Payme/Click/Uzum integration.
4. **Zero-Dependency Node.js Backend (`server/server.mjs`):**
   - Direct connection to the Telegram Bot SQLite database (`fenix_restaurant.db`).
   - Every reservation is saved to the `reservations` table.
   - Every order is saved to the `orders` table.
   - Every banquet inquiry is saved to the `event_inquiries` table.
   - Instant push notifications sent to all registered restaurant staff via Telegram Bot API (`@Fenix_restaurant_bot`).
   - Healthcheck & status endpoint at `GET /api/status`.

## How to Run
- **Static Preview:** Double-click `index.html` in Chrome, Safari, or Yandex Browser.
- **Full-Stack Server (Node.js 18+ / 24+):**
  ```bash
  node server/server.mjs
  ```
  The server starts at `http://localhost:3000` and automatically connects to the bot's SQLite database and token.
- **Run Both Website & Bot Together:**
  Run `run_all.bat` in the root workspace folder to launch both the website and the Telegram bot simultaneously.
