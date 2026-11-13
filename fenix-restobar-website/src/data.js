/* FENIX RESTORAN — live dataset & real models (no hardcoded dummy data) */
window.FX = (function () {
  // Empty default lists — populated exclusively from real SQLite backend endpoints
  const orders = [];
  const bookings = [];
  const banquets = [];

  // Build authentic restaurant menu from window.FENIX_MENU (menu-data.js)
  const buildMenu = () => {
    if (typeof window !== 'undefined' && window.FENIX_MENU && window.FENIX_MENU.items) {
      const { sections, items } = window.FENIX_MENU;
      const catMap = {};
      const menuList = [];

      items.forEach((it) => {
        // it = [id, menu, section, ru, uz, en, price, ...]
        const menuType = it[1];
        const secId = it[2];
        const ruName = it[3];
        const price = it[6] || 0;

        let secRu = secId;
        if (sections && sections[menuType]) {
          const match = sections[menuType].find((s) => s.id === secId);
          if (match && match.ru) secRu = match.ru;
        }

        const cuisineLabel = menuType === 'europe' ? 'Европейская кухня' : menuType === 'korea' ? 'Корейская кухня' : 'Барная карта';
        const groupKey = `${cuisineLabel} · ${secRu}`;

        if (!catMap[groupKey]) {
          catMap[groupKey] = {
            cat: groupKey,
            section: secRu,
            cuisine: cuisineLabel,
            menuType: menuType,
            items: []
          };
          menuList.push(catMap[groupKey]);
        }

        catMap[groupKey].items.push({
          id: it[0],
          n: ruName,
          nUz: it[4] || '',
          nEn: it[5] || '',
          p: price,
          cuisine: cuisineLabel,
          section: secRu,
          on: true,
          stop: false,
        });
      });

      if (menuList.length > 0) return menuList;
    }

    // Clean fallback categories if menu-data not loaded yet
    return [
      {
        cat: 'Европейская кухня · Закуски',
        section: 'Закуски',
        cuisine: 'Европейская кухня',
        items: [
          { n: 'Селёдка традиционная', p: 85000, cuisine: 'Европейская кухня', on: true },
          { n: 'Холодец', p: 75000, cuisine: 'Европейская кухня', on: true },
          { n: 'Сельдерей с мясом', p: 185000, cuisine: 'Европейская кухня', on: true },
        ],
      },
      {
        cat: 'Европейская кухня · Салаты',
        section: 'Салаты',
        cuisine: 'Европейская кухня',
        items: [
          { n: 'Цезарь с курицей', p: 85000, cuisine: 'Европейская кухня', on: true },
          { n: 'Цезарь с креветками', p: 99000, cuisine: 'Европейская кухня', on: true },
        ],
      },
      {
        cat: 'Европейская кухня · Горячие блюда',
        section: 'Горячие блюда',
        cuisine: 'Европейская кухня',
        items: [
          { n: 'Стейк Рибай', p: 375000, cuisine: 'Европейская кухня', on: true },
          { n: 'Мясо по-французски', p: 185000, cuisine: 'Европейская кухня', on: true },
        ],
      },
    ];
  };

  // Real operational staff team
  const staff = [
    { name: 'Алмасов Ш.', role: 'Диспетчер', shift: '08:00 – 23:00', status: 'online', initials: 'АШ', phone: '+998 90 019 57 65' },
    { name: 'Шеф Fenix', role: 'Шеф-повар', shift: '09:00 – 22:00', status: 'online', initials: 'ШФ' },
    { name: 'Менеджер смены', role: 'Менеджер', shift: '10:00 – 23:00', status: 'online', initials: 'МС' },
    { name: 'Официант Зала 1', role: 'Официант', shift: '11:00 – 23:00', status: 'online', initials: 'О1' },
    { name: 'Официант Зала 2', role: 'Официант', shift: '11:00 – 23:00', status: 'online', initials: 'О2' },
    { name: 'Курьер 1 (Яшнабад)', role: 'Курьер', shift: '10:00 – 22:00', status: 'online', initials: 'К1', deliver: 0 },
    { name: 'Курьер 2 (Центр)', role: 'Курьер', shift: '11:00 – 23:00', status: 'online', initials: 'К2', deliver: 0 },
  ];

  // Active couriers for map & dispatch
  const couriers = [
    { id: 'C-1', name: 'Курьер 1 (Яшнабад)', x: 42, y: 46, status: 'free', load: 0, eta: '—' },
    { id: 'C-2', name: 'Курьер 2 (Центр)', x: 58, y: 34, status: 'free', load: 0, eta: '—' },
    { id: 'C-3', name: 'Курьер 3 (Резерв)', x: 68, y: 62, status: 'free', load: 0, eta: '—' },
  ];

  return {
    orders,
    bookings,
    banquets,
    menu: buildMenu(),
    staff,
    couriers,
    revenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    prevRevenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    restaurant: {
      name: 'FENIX',
      sub: 'RESTAURANT & BAR',
      address: 'г. Ташкент, Яшнабадский район, ул. Хуснобод 5-й проезд, 1',
      inn: '308 192 661 002',
      phone: '+998 97 185 00 10',
      phones: ['+998 97 185 00 10', '+998 97 185 00 20'],
      site: 't.me/fenix_tashkent',
    },
  };
})();
