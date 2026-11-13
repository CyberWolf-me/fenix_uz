/* ==========================================================================
   FENIX RESTOBAR — SINGLE SOURCE OF TRUTH (Sections 2, 7.5, 7.6, 12)
   Every unconfirmed fact carries an explicit [[OWNER: ...]] placeholder.
   ========================================================================== */
window.FENIX_FACTS = {
  brand: {
    displayName: "FENIX Restobar",
    conceptName: "Fenix, Restaurant & Bar",
    namePlaceholder: "[[OWNER: confirm official restaurant name]]",
    city: "Tashkent",
    country: "UZ"
  },
  address: {
    verified: true,
    ru: "Ташкент, Яшнабадский район, ул. Хуснобод 5-й проезд, 1",
    uz: "Toshkent, Yashnobod tumani, Husnobod 5-tor ko'chasi, 1",
    en: "Tashkent, Yashnobod district, Husnobod 5-tor ko'chasi, 1",
    yandexMapsUrl: "https://yandex.com/maps/org/fenix/21833806944/",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Fenix+Husnobod+1+Tashkent"
  },
  phones: [
    {
      number: "+998971850010",
      display: "+998 97 185 00 10",
      verified: true,
      notePlaceholder: "[[OWNER: confirm reservations vs. events line]]"
    },
    {
      number: "+998971850020",
      display: "+998 97 185 00 20",
      verified: true,
      notePlaceholder: "[[OWNER: confirm reservations vs. events line]]"
    }
  ],
  hours: {
    status: "Draft",
    timezone: "Asia/Tashkent",
    utcOffsetHours: 5,
    placeholder: "[[OWNER: opening hours, last seating time, and holiday closures]]",
    schedule: {
      0: { open: "12:00", close: "00:00", nextDayClose: false }, // Sun
      1: { open: "12:00", close: "00:00", nextDayClose: false }, // Mon
      2: { open: "12:00", close: "00:00", nextDayClose: false }, // Tue
      3: { open: "12:00", close: "00:00", nextDayClose: false }, // Wed
      4: { open: "12:00", close: "00:00", nextDayClose: false }, // Thu
      5: { open: "12:00", close: "02:00", nextDayClose: true },  // Fri (closes 02:00 Sat)
      6: { open: "12:00", close: "02:00", nextDayClose: true }   // Sat (closes 02:00 Sun)
    },
    liveMusic: {
      days: [5, 6],
      from: "20:00",
      placeholder: "[[OWNER: confirm live music schedule]]"
    }
  },
  halls: {
    status: "Conflict (Telegram 120/170 vs. Concept 100)",
    floor1Capacity: 120,
    floor2Capacity: 170,
    placeholder: "[[OWNER: capacity of each hall and real number of seats]]"
  },
  averageBill: {
    status: "Draft",
    min: 200000,
    max: 500000,
    placeholder: "[[OWNER: confirm average bill]]"
  },
  socials: {
    instagram: "https://www.instagram.com/fenix.tashkent",
    instagramHandle: "@fenix.tashkent",
    telegram: "https://t.me/fenix_tashkent",
    telegramHandle: "t.me/fenix_tashkent",
    telegramBot: "https://t.me/Fenix_restaurant_bot",
    telegramBotHandle: "@Fenix_restaurant_bot"
  },
  operations: {
    replySlaPlaceholder: "[[OWNER: confirmation reply window in minutes]]",
    eventPackagesPlaceholder: "[[OWNER: event packages, minimum guests, deposit policy, and what is included]]",
    deliveryPlaceholder: "[[OWNER: delivery zones, minimum order, delivery fee, and Payme/Click/Uzum merchant details]]",
    legalFooterPlaceholder: "[[OWNER: legal entity name, INN, and registered address]]"
  }
};
