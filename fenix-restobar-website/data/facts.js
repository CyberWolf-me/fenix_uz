/* Restaurant facts — one place (brief §9). status: verified | draft | owner
   verified = Telegram channel t.me/fenix_tashkent; draft = map listing via concept; owner = must be supplied. */
window.FENIX_FACTS = {
  name: { value: 'Fenix Restaurant & Bar', status: 'owner', note: 'Telegram: "FENIX Restobar"; signage: "Fenix Restaurant & Bar"' },
  address: {
    ru: 'Ташкент, Яшнабадский р-н, 5-й проезд Хуснобод, 1',
    uz: 'Toshkent, Yashnobod tumani, Husnobod 5-tor koʻchasi, 1',
    en: 'Husnobod 5-tor koʻchasi 1, Yashnobod, Tashkent',
    status: 'verified'
  },
  phones: [
    { display: '+998 97 185 00 10', href: 'tel:+998971850010', status: 'verified' },
    { display: '+998 97 185 00 20', href: 'tel:+998971850020', status: 'verified' }
  ],
  telegram: { display: 't.me/fenix_tashkent', href: 'https://t.me/fenix_tashkent', status: 'verified' },
  bot: { display: '@FenixRestaurantBot', href: 'https://t.me/FenixRestaurantBot', status: 'verified' },
  instagram: { display: '@fenix.tashkent', href: 'https://www.instagram.com/fenix.tashkent', status: 'verified' },
  maps: {
    yandex: 'https://yandex.uz/maps/?text=' + encodeURIComponent('Fenix Restaurant Husnobod 5-tor 1 Tashkent'),
    google: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Fenix Restaurant Husnobod 5-tor 1 Tashkent'),
    status: 'owner'  /* replace with organisation links */
  },
  halls: { first: 120, second: 170, status: 'verified-conflict' },
  /* Hours: DRAFT. close < open means after midnight. day 0 = Sunday */
  hours: {
    status: 'draft',
    tzOffsetMin: 300,
    week: { 0:['12:00','00:00'], 1:['12:00','00:00'], 2:['12:00','00:00'], 3:['12:00','00:00'], 4:['12:00','00:00'], 5:['12:00','02:00'], 6:['12:00','02:00'] },
    lastSlotBeforeCloseMin: 60,
    music: { days:[5,6], from:'20:00', status:'draft' }
  },
  averageBill: { value: '200 000 – 500 000', status: 'draft' }
};
