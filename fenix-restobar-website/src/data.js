/* FENIX RESTORAN — demo dataset (plain script, no JSX) */
window.FX = (function () {
  const D = (n) => n; // identity, keeps price literals readable

  const raw = [
    /* ── NEW ─────────────────────────────────────────────── */
    { id: 'WEB-3324', type: 'delivery', col: 'new', client: 'Malika Yusupova', phone: '+998 90 987 44 12',
      addr: 'Юнусабад, 12-й квартал, дом 34, кв. 8', elapsed: 47, sla: 45, pay: 'card',
      note: 'Без лука, острый соус отдельно',
      items: [{ n: 'Плов «Феникс»', q: 2, p: 78000 }, { n: 'Салат «Ачичук»', q: 1, p: 32000 }] },

    { id: 'WEB-3321', type: 'pickup', col: 'new', client: 'Dilnoza Karimova', phone: '+998 93 410 22 08',
      elapsed: 6, sla: 25, pay: 'cash',
      items: [{ n: 'Лагман по-домашнему', q: 1, p: 62000 }, { n: 'Чай с чабрецом', q: 2, p: 12000 }] },

    { id: 'WEB-3318', type: 'hall', col: 'new', client: 'Rustam Yo‘ldoshev', phone: '+998 90 331 55 90',
      table: 'Стол 7 · Основной зал', elapsed: 3, sla: 40, pay: 'card',
      items: [{ n: 'Мясо по-французски', q: 1, p: 96000 }, { n: 'Цезарь с креветками', q: 1, p: 74000 },
              { n: 'Лемонад домашний', q: 2, p: 24000 }] },

    { id: 'WEB-3317', type: 'delivery', col: 'new', client: 'Aziza Nazarova', phone: '+998 91 707 12 34',
      addr: 'Мирабад, ул. Шахрисабз, 5', elapsed: 12, sla: 50, pay: 'cash',
      items: [{ n: 'Шашлык из баранины', q: 4, p: 28000 }, { n: 'Лепёшка тандырная', q: 2, p: 8000 }] },

    { id: 'WEB-3316', type: 'pickup', col: 'new', client: 'Jahongir Rahimov', phone: '+998 99 812 40 06',
      elapsed: 21, sla: 25, pay: 'card',
      items: [{ n: 'Манты с бараниной', q: 2, p: 46000 }, { n: 'Сметана', q: 1, p: 6000 }] },

    /* ── KITCHEN ─────────────────────────────────────────── */
    { id: 'WEB-2580', type: 'pickup', col: 'kitchen', client: 'Гость с веб-сайта', phone: '+998 71 200 00 10',
      elapsed: 33, sla: 45, pay: 'card',
      items: [{ n: 'Сельдерей с мясом', q: 1, p: 118000 }, { n: 'Лапша с тефтелькой', q: 1, p: 132000 }] },

    { id: 'WEB-3312', type: 'delivery', col: 'kitchen', client: 'Nodira Aliyeva', phone: '+998 90 555 77 21',
      addr: 'Чиланзар, квартал 19, дом 12', elapsed: 18, sla: 50, pay: 'card',
      note: 'Приборы на 2 персоны',
      items: [{ n: 'Рёбра с овощами', q: 1, p: 145000 }, { n: 'Салат «Феникс»', q: 1, p: 68000 }] },

    { id: 'WEB-3308', type: 'hall', col: 'kitchen', client: 'Timur Saidov', phone: '+998 94 220 88 10',
      table: 'Стол 12 · Основной зал', elapsed: 24, sla: 40, pay: 'cash',
      items: [{ n: 'Плов «Феникс»', q: 3, p: 78000 }, { n: 'Ачичук', q: 2, p: 32000 },
              { n: 'Чай зелёный', q: 1, p: 10000 }] },

    { id: 'WEB-3306', type: 'delivery', col: 'kitchen', client: 'Guest', phone: '+998 97 004 31 18',
      addr: 'Шайхантахур, ул. Навои, 41', elapsed: 9, sla: 45, pay: 'cash',
      items: [{ n: 'Мясо по-французски', q: 2, p: 96000 }] },

    /* ── ON THE WAY ──────────────────────────────────────── */
    { id: 'WEB-7413', type: 'delivery', col: 'way', client: 'Алмасов', phone: '+9989001957655',
      addr: 'Ниёзбек Йули кўчаси, 1а (Fenix restoran)', elapsed: 34, sla: 45, pay: 'cash',
      courier: 'Ш. Ахмедов', items: [{ n: 'Мясо по-французски', q: 1, p: 138000 }, { n: 'Рёбра с овощами', q: 1, p: 154000 },
              { n: 'Сельдерей с мясом', q: 1, p: 118000 }] },

    { id: 'WEB-3305', type: 'delivery', col: 'way', client: 'Азиза Н.', phone: '+998 90 121 09 87',
      addr: 'Юнусабад, ул. Богишамол, 22', courier: 'Д. Каримов', elapsed: 27, sla: 45, pay: 'card',
      items: [{ n: 'Лагман', q: 2, p: 62000 }, { n: 'Самса', q: 3, p: 14000 }] },

    { id: 'WEB-3303', type: 'delivery', col: 'way', client: 'Bekzod Tursunov', phone: '+998 93 606 71 40',
      addr: 'Мирабад, ул. Ойбек, 18', courier: 'Р. Юсупов', elapsed: 15, sla: 45, pay: 'cash',
      items: [{ n: 'Плов «Феникс»', q: 1, p: 78000 }, { n: 'Лепёшка', q: 2, p: 8000 }] },

    /* ── DONE ────────────────────────────────────────────── */
    { id: 'WEB-3298', type: 'delivery', col: 'done', client: 'Shahnoza Q.', phone: '+998 90 445 10 02',
      addr: 'Чиланзар, квартал 4, дом 7', courier: 'Ш. Ахмедов', elapsed: 74, sla: 45, pay: 'card',
      items: [{ n: 'Рёбра с овощами', q: 1, p: 145000 }, { n: 'Салат «Феникс»', q: 1, p: 68000 }] },

    { id: 'WEB-3295', type: 'hall', col: 'done', client: 'Ойбек М.', phone: '+998 99 300 44 55',
      table: 'Стол 3 · Основной зал', elapsed: 96, sla: 40, pay: 'card',
      items: [{ n: 'Мясо по-французски', q: 1, p: 96000 }, { n: 'Чай', q: 2, p: 10000 }] },

    { id: 'WEB-3292', type: 'pickup', col: 'done', client: 'Guest', phone: '+998 71 200 00 10',
      elapsed: 118, sla: 25, pay: 'cash',
      items: [{ n: 'Манты', q: 2, p: 46000 }] },
  ];

  raw.forEach((o, i) => {
    const fee = o.type === 'delivery' ? 15000 : 0;
    o.fee = fee;
    o.total = o.items.reduce((s, it) => s + it.q * it.p, 0) + fee;
    o.createdAt = Date.now() - o.elapsed * 60000;
  });

  const bookings = [
    { id: 'WEB-9852', date: 'today', client: 'Тимур', phone: '+9989901234567', guests: 3,
      zone: 'Основной зал', time: '19:30', status: 'pending', table: 'Стол 9' },
    { id: 'WEB-6819', date: 'today', client: 'Feruzbek Axmedov', phone: '+9989444448484', guests: 4,
      zone: 'any', time: '23:30', status: 'pending' },
    { id: 'WEB-5880', date: 'today', client: 'Feruzbek Axmedov', phone: '+9989444448484', guests: 4,
      zone: 'any', time: '23:30', status: 'pending' },
    { id: 'WEB-1268', date: 'today', client: 'Redesign Guest', phone: '+998901234567', guests: 4,
      zone: 'Основной зал', time: '19:30', status: 'pending' },
    { id: 'WEB-9741', date: 'today', client: 'Nodira Aliyeva', phone: '+998 90 555 77 21', guests: 2,
      zone: 'VIP-кабина', time: '20:00', status: 'confirmed', table: 'VIP 2' },
    { id: 'WEB-9738', date: 'today', client: 'Jasur Ismoilov', phone: '+998 93 210 44 09', guests: 6,
      zone: 'Банкетный зал', time: '18:00', status: 'confirmed', table: 'БЗ-1' },
    { id: 'WEB-9735', date: 'today', client: 'Дилноза К.', phone: '+998 90 111 22 33', guests: 4,
      zone: 'Основной зал', time: '13:00', status: 'seated', table: 'Стол 4' },
    { id: 'WEB-9729', date: 'tomorrow', client: 'Rustam Yo‘ldoshev', phone: '+998 90 331 55 90', guests: 8,
      zone: 'Банкетный зал', time: '19:00', status: 'confirmed', table: 'БЗ-2' },
    { id: 'WEB-9722', date: 'tomorrow', client: 'Malika Yusupova', phone: '+998 90 987 44 12', guests: 2,
      zone: 'VIP-кабина', time: '21:00', status: 'cancelled' },
  ];

  const banquets = [
    { id: 'BNQ-0042', date: '2026-11-20', client: 'Азиза Каримова', phone: '+998 90 331 22 11',
      kind: 'Свадьба (никах)', guests: 80, hall: 'Банкетный зал', deposit: 12000000, status: 'waiting' },
    { id: 'BNQ-0041', date: '2026-11-19', client: 'Sardor Aliyev', phone: '+998 93 505 40 20',
      kind: 'Корпоратив', guests: 45, hall: 'Банкетный зал', deposit: 6500000, status: 'confirmed' },
    { id: 'BNQ-0039', date: '2026-11-22', client: 'Дилшод Рахимов', phone: '+998 91 220 88 77',
      kind: 'Юбилей 50 лет', guests: 30, hall: 'VIP-кабина', deposit: 4200000, status: 'waiting' },
    { id: 'BNQ-0036', date: '2026-11-25', client: 'Kamola Yusupova', phone: '+998 90 700 11 44',
      kind: 'Детский праздник', guests: 25, hall: 'Основной зал', deposit: 2800000, status: 'confirmed' },
    { id: 'BNQ-0031', date: '2026-12-01', client: 'Bekzod Tursunov', phone: '+998 93 606 71 40',
      kind: 'Корпоратив', guests: 60, hall: 'Банкетный зал', deposit: 9000000, status: 'draft' },
  ];

  const menu = [
    { cat: 'Салаты', items: [
      { n: 'Салат «Феникс»', p: 68000, cost: 24000, on: true, star: true },
      { n: 'Цезарь с креветками', p: 74000, cost: 31000, on: true },
      { n: 'Ачичук', p: 32000, cost: 9000, on: true },
      { n: 'Сельдерей с мясом', p: 118000, cost: 47000, on: true, star: true },
    ]},
    { cat: 'Супы', items: [
      { n: 'Лапша с тефтелькой', p: 132000, cost: 52000, on: true },
      { n: 'Шурпа из баранины', p: 86000, cost: 33000, on: true },
      { n: 'Мастава', p: 54000, cost: 18000, on: false, stop: true },
    ]},
    { cat: 'Горячее', items: [
      { n: 'Мясо по-французски', p: 96000, cost: 38000, on: true, star: true },
      { n: 'Рёбра с овощами', p: 145000, cost: 61000, on: true },
      { n: 'Плов «Феникс»', p: 78000, cost: 27000, on: true, star: true },
      { n: 'Шашлык из баранины', p: 28000, cost: 12000, on: true },
      { n: 'Лагман по-домашнему', p: 62000, cost: 22000, on: true },
      { n: 'Манты с бараниной', p: 46000, cost: 17000, on: true },
    ]},
    { cat: 'Выпечка', items: [
      { n: 'Самса', p: 14000, cost: 5000, on: true },
      { n: 'Лепёшка тандырная', p: 8000, cost: 2000, on: true },
    ]},
    { cat: 'Напитки', items: [
      { n: 'Чай с чабрецом', p: 12000, cost: 3000, on: true },
      { n: 'Лемонад домашний', p: 24000, cost: 7000, on: true },
      { n: 'Айран', p: 15000, cost: 5000, on: true },
    ]},
  ];

  const staff = [
    { name: 'Алмасов Ш.', role: 'Диспетчер', shift: '08:00 – 23:00', status: 'online', initials: 'АШ',
      phone: '+998 90 019 57 65' },
    { name: 'Ш. Ахмедов', role: 'Курьер', shift: '10:00 – 20:00', status: 'busy', initials: 'ША', deliver: 3 },
    { name: 'Д. Каримов', role: 'Курьер', shift: '11:00 – 21:00', status: 'busy', initials: 'ДК', deliver: 2 },
    { name: 'Р. Юсупов', role: 'Курьер', shift: '12:00 – 22:00', status: 'online', initials: 'РЮ', deliver: 1 },
    { name: 'Т. Мирзаев', role: 'Курьер', shift: '12:00 – 22:00', status: 'offline', initials: 'ТМ', deliver: 0 },
    { name: 'Зафар Ш.', role: 'Шеф-повар', shift: '09:00 – 22:00', status: 'online', initials: 'ЗШ' },
    { name: 'Нилуфар С.', role: 'Официант', shift: '14:00 – 23:00', status: 'online', initials: 'НС' },
    { name: 'Ойбек М.', role: 'Официант', shift: '14:00 – 23:00', status: 'online', initials: 'ОМ' },
    { name: 'Гулноза А.', role: 'Менеджер', shift: '10:00 – 19:00', status: 'online', initials: 'ГА' },
  ];

  const couriers = [
    { id: 'C-1', name: 'Ш. Ахмедов', x: 34, y: 44, status: 'busy', load: 3, eta: '7 мин', job: 'WEB-7413' },
    { id: 'C-2', name: 'Д. Каримов', x: 62, y: 30, status: 'busy', load: 2, eta: '12 мин', job: 'WEB-3305' },
    { id: 'C-3', name: 'Р. Юсупов', x: 71, y: 63, status: 'busy', load: 1, eta: '4 мин', job: 'WEB-3303' },
    { id: 'C-4', name: 'Б. Сафаров', x: 22, y: 72, status: 'free', load: 0, eta: '—' },
    { id: 'C-5', name: 'Т. Мирзаев', x: 48, y: 80, status: 'free', load: 0, eta: '—' },
  ];

  /* hourly revenue (11:00 → 22:00) in thousands of сум */
  const revenue = [42, 68, 95, 120, 88, 74, 110, 168, 214, 196, 148, 110];
  const prevRevenue = [38, 55, 82, 98, 76, 62, 96, 140, 178, 162, 120, 92];
  const kitchenLoad = [
    { h: '12:00', orders: 14, load: 62 }, { h: '13:00', orders: 21, load: 88 },
    { h: '14:00', orders: 17, load: 74 }, { h: '15:00', orders: 9, load: 41 },
    { h: '16:00', orders: 7, load: 33 }, { h: '17:00', orders: 12, load: 55 },
    { h: '18:00', orders: 19, load: 81 }, { h: '19:00', orders: 26, load: 96 },
    { h: '20:00', orders: 23, load: 90 }, { h: '21:00', orders: 16, load: 68 },
  ];

  return { orders: raw, bookings, banquets, menu, staff, couriers, revenue, prevRevenue, kitchenLoad,
    restaurant: {
      name: 'FENIX', sub: 'RESTORAN', address: 'г. Ташкент, ул. Юнуса Раджабийского, ТЦ «Roison», 3 этаж, магазин 24',
      inn: '308 192 661 002', phone: '+998 71 200 00 10', site: 'www.fenix-restobar.uz',
    } };
})();
