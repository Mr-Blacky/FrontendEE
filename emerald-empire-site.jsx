// ============================================================
// PATH: frontend/pages/EmeraldEmpireSite.jsx
// Emerald Empire — полный сайт-студия для сценаристов
// v3.0 — темы, турниры×2, монетизация, форум, 7 игр, круглый лангсвитчер
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { THEMES, THEME_IDS } from "./emerald-empire-site/themes.js";
import { EmeraldLogo } from "./emerald-empire-site/Logo.jsx";
import { GamesHub, GAME_LIST } from "./emerald-empire-site/games.jsx";
import {
  ensureGuestProfile,
  saveGuestProfile,
  getGuestId,
  getAuthToken,
  setAuthToken,
  isAdminMode,
  setAdminMode,
  API_BASE,
} from "./emerald-empire-site/auth.js";

// ── Переводы ─────────────────────────────────────────────────
const i18n = {
  RU: {
    nav: {
      home: "Главная", about: "О нас", portfolio: "Портфолио",
      scripts: "Сценарии", blog: "Блог", contact: "Контакты",
      login: "Войти", tournaments: "Турниры", games: "Игры",
      dashboard: "Кабинет", forum: "Форум",
    },
    hero: {
      tag: "Премиальная студия сценаристов",
      title: "EMERALD\nEMPIRE",
      subtitle: "Создаём истории, которые меняют мир. Пишите, публикуйте и монетизируйте свои сценарии на одной платформе.",
      cta: "Начать путь", cta2: "Смотреть портфолио",
    },
    about: {
      title: "О студии", sub: "Мы — команда профессиональных сценаристов и продюсеров",
      p1: "Emerald Empire — это премиальная платформа для создателей контента: сценаристов, режиссёров и продюсеров.",
      p2: "С 2020 года мы помогли более 500 авторам найти свою аудиторию и монетизировать своё творчество.",
      stats: [{ n: "500+", l: "Авторов" }, { n: "1200+", l: "Сценариев" }, { n: "3", l: "Языка" }, { n: "98%", l: "Довольных" }],
    },
    portfolio: {
      title: "Портфолио", sub: "Избранные работы наших авторов",
      items: [
        { title: "Тени над городом", genre: "Триллер", author: "А. Иванов", year: "2024" },
        { title: "Последний рассвет", genre: "Драма", author: "М. Садыков", year: "2024" },
        { title: "Параллельные миры", genre: "Фантастика", author: "Л. Ким", year: "2023" },
        { title: "Код молчания", genre: "Детектив", author: "Н. Петров", year: "2023" },
        { title: "Голос пустыни", genre: "Документальное", author: "З. Алиев", year: "2024" },
        { title: "Нить судьбы", genre: "Мелодрама", author: "О. Юсупова", year: "2023" },
      ],
    },
    scripts: {
      title: "Сценарии", sub: "Загружайте, ищите и обсуждайте",
      search: "Поиск по сценариям...", upload: "Загрузить сценарий",
      filters: ["Все", "Триллер", "Драма", "Фантастика", "Детектив"],
      items: [
        { title: "Тени над городом", genre: "Триллер", pages: 94, price: "Бесплатно", author: "А. Иванов", comments: 12 },
        { title: "Параллельные миры", genre: "Фантастика", pages: 108, price: "500 сум", author: "Л. Ким", comments: 8 },
        { title: "Последний рассвет", genre: "Драма", pages: 87, price: "Бесплатно", author: "М. Садыков", comments: 21 },
        { title: "Код молчания", genre: "Детектив", pages: 102, price: "750 сум", author: "Н. Петров", comments: 5 },
      ],
      paidLabel: "Платный доступ", freeLabel: "Бесплатно",
      priceHint: "Сумма в USD. ≤$8 — без комиссии, >$8 — комиссия 5%.",
      needCard: "Публикация платного сценария требует привязанной карты в разделе «Монетизация».",
    },
    reviews: {
      title: "Отзывы", sub: "Что говорят наши авторы",
      items: [
        { text: "Emerald Empire дала мне возможность выйти на международный уровень. Отличная платформа!", name: "Алишер Каримов", role: "Сценарист" },
        { text: "Наконец-то есть место, где ценят качественные истории. Мои работы нашли своих зрителей.", name: "Малика Юсупова", role: "Драматург" },
        { text: "Удобный интерфейс, быстрая обратная связь, отзывчивая команда. Рекомендую всем!", name: "Тимур Назаров", role: "Режиссёр" },
      ],
    },
    blog: {
      title: "Блог", sub: "Советы, новости и вдохновение",
      items: [
        { tag: "Мастер-класс", title: "10 правил хорошего диалога в сценарии", date: "28 мая 2025", min: "7 мин" },
        { tag: "Новости", title: "Emerald Empire запускает программу менторства", date: "15 мая 2025", min: "4 мин" },
        { tag: "Советы", title: "Как монетизировать свои сценарии в 2025 году", date: "2 мая 2025", min: "9 мин" },
      ],
    },
    contact: {
      title: "Контакты", sub: "Свяжитесь с нами",
      name: "Ваше имя", email: "Email", message: "Сообщение", send: "Отправить",
      or: "Или найдите нас в соцсетях",
    },
    auth: {
      title: "Вход в аккаунт", email: "Email", pass: "Пароль",
      code: "Код из письма", btn: "Войти",
      step2: "Введите код подтверждения", resend: "Отправить код повторно",
      noAcc: "Нет аккаунта? Зарегистрироваться",
    },
    footer: { copy: "© 2025 Emerald Empire Studio. Все права защищены.", lang: "Язык" },
    tournaments: {
      title: "Турниры",
      bookTitle: "Забронировать турнир",
      bookSub: "Организуйте свой турнир на нашей платформе",
      registerTitle: "Зарегистрировать место",
      registerSub: "Примите участие в турнире",
      bookBtn: "Забронировать турнир",
      registerBtn: "Зарегистрировать место",
      form: { submit: "Подать заявку", success: "Заявка отправлена и ожидает подтверждения!", pending: "Ожидает подтверждения", discord: "Перейти в Discord" },
      bookNoForm: "Организатору не нужно заполнять форму участника.",
      regFree: "Участие бесплатно. Слот не занимается автоматически.",
      guestBlock: "Войдите в аккаунт для регистрации на турнир.",
      slots: ["10:00–12:00", "12:00–14:00", "14:00–16:00", "16:00–18:00", "18:00–20:00"],
      maxPlayers: "Максимум 18 участников",
      bookPrices: ["$13.66 — Базовый", "$34.15 — Стандарт", "$68.30 — Премиум"],
      regPrices: [],
      paymentNote: "Для бронирования нужна платёжная карта.", addCard: "Привязать карту",
      bookingRules: "Бронирование не позднее чем за 36 часов.",
      back: "← Назад", tabBook: "📋 Организаторам", tabRegister: "🏆 Участникам",
    },
    dashboard: {
      guestBadge: "Гостевой режим",
      guestHint: "Полный интерфейс. Ограничено: карты, турниры, публикация сценариев, форум. Лайки доступны.",
      promo: "Промокод",
      promoPh: "Введите промокод",
      promoBtn: "Активировать",
      promoOk: "Админ‑режим активирован",
      promoFail: "Неверный промокод",
      admin: "Админ",
      audit: "Журнал действий",
      title: "Личный кабинет",
      uploadAvatar: "Загрузить фото",
      subscriptions: "Подписки",
      themes: "Темы",
      settings: "Настройки",
      monetization: "Монетизация",
      plans: [
        { price: "$3.70/мес", pages: "до 40 страниц", times: "1 раз в месяц" },
        { price: "$7.30/мес", pages: "до 100 страниц", times: "3 раза в месяц" },
        { price: "$16.79/мес или $108 пожизненно", pages: "до 200 страниц", times: "5 раз в месяц" },
        { price: "$32.85/мес", pages: "до 500 страниц", times: "30 раз в месяц" },
      ],
      subscribe: "Подписаться", currentPlan: "Текущий тариф",
      monet: {
        title: "Монетизация",
        sub: "Привяжите карту для получения выплат",
        addCard: "Привязать карту для выплат",
        pending: "Карта на проверке у администратора",
        approved: "Карта одобрена ✓",
        rejected: "Карта отклонена. Свяжитесь с поддержкой.",
        note: "Карта для монетизации не может совпадать с платёжной картой.",
        cardNum: "Номер карты",
        expiry: "ММ/ГГ",
        submit: "Отправить на проверку",
      },
    },
    games: {
      title: "Игры", sub: "14 браузерных игр Emerald Empire (6 уровней, кроме Flappy)",
      list: GAME_LIST,
      back: "← К играм",
      start: "Нажмите Space или тапните",
      over: "Игра окончена", score: "Счёт", best: "Рекорд", restart: "Заново",
    },
    forum: {
      title: "Форум", sub: "Идеи и общение",
      newPost: "Новая тема", searchPh: "Поиск по тегам...",
      filters: ["Все", "Идеи", "Вопросы", "Анонсы", "Разное"],
      postTitle: "Заголовок темы", postBody: "Текст...", postTag: "Тег",
      submit: "Опубликовать", cancel: "Отмена",
      reply: "Ответить", replies: "ответов",
      bannedMsg: "Ваш аккаунт ограничен. Вы можете общаться только с администратором.",
      linkWarn: "Ссылки запрещены. Комментарий удалён.",
    },
  },
  UZ: {
    nav: {
      home: "Bosh sahifa", about: "Biz haqimizda", portfolio: "Portfolio",
      scripts: "Ssenariylar", blog: "Blog", contact: "Aloqa",
      login: "Kirish", tournaments: "Turnirlar", games: "O'yinlar",
      dashboard: "Kabinet", forum: "Forum",
    },
    hero: {
      tag: "Premium ssenaristlar studiyasi",
      title: "EMERALD\nEMPIRE",
      subtitle: "Dunyoni o'zgartiradigan hikoyalar yarating.",
      cta: "Yo'lni boshlash", cta2: "Portfolio ko'rish",
    },
    about: {
      title: "Studio haqida", sub: "Biz professional ssenaristlar va prodyuserlar jamoasimiz",
      p1: "Emerald Empire — kontent yaratuvchilar uchun premium platforma.",
      p2: "2020 yildan beri 500 dan ortiq muallif o'z auditoriyasini topdi.",
      stats: [{ n: "500+", l: "Mualliflar" }, { n: "1200+", l: "Ssenariylar" }, { n: "3", l: "Til" }, { n: "98%", l: "Mamnunlar" }],
    },
    portfolio: {
      title: "Portfolio", sub: "Mualliflarimizning tanlangan asarlari",
      items: [
        { title: "Shahar ustidagi soyalar", genre: "Triller", author: "A. Ivanov", year: "2024" },
        { title: "So'nggi tong", genre: "Drama", author: "M. Sadiqov", year: "2024" },
        { title: "Parallel olamlar", genre: "Fantastika", author: "L. Kim", year: "2023" },
        { title: "Jimlik kodi", genre: "Detektiv", author: "N. Petrov", year: "2023" },
        { title: "Cho'l ovozi", genre: "Hujjatli", author: "Z. Aliyev", year: "2024" },
        { title: "Taqdir ipi", genre: "Melodrama", author: "O. Yusupova", year: "2023" },
      ],
    },
    scripts: {
      title: "Ssenariylar", sub: "Yuklang, qidiring va muhokama qiling",
      search: "Ssenariy qidirish...", upload: "Ssenariy yuklash",
      filters: ["Hammasi", "Triller", "Drama", "Fantastika", "Detektiv"],
      items: [
        { title: "Shahar ustidagi soyalar", genre: "Triller", pages: 94, price: "Bepul", author: "A. Ivanov", comments: 12 },
        { title: "Parallel olamlar", genre: "Fantastika", pages: 108, price: "500 so'm", author: "L. Kim", comments: 8 },
        { title: "So'nggi tong", genre: "Drama", pages: 87, price: "Bepul", author: "M. Sadiqov", comments: 21 },
        { title: "Jimlik kodi", genre: "Detektiv", pages: 102, price: "750 so'm", author: "N. Petrov", comments: 5 },
      ],
      paidLabel: "Pullik kirish", freeLabel: "Bepul",
      priceHint: "USD summasi. ≤$8 — komissiyasiz, >$8 — 5% komissiya.",
      needCard: "Pullik ssenariy nashr qilish uchun monetizatsiya bo'limida karta bog'lash kerak.",
    },
    reviews: {
      title: "Sharhlar", sub: "Mualliflarimiz nima deydi",
      items: [
        { text: "Emerald Empire menga xalqaro darajaga chiqish imkonini berdi!", name: "Alisher Karimov", role: "Ssenarist" },
        { text: "Nihoyat sifatli hikoyalarni qadrlashadi.", name: "Malika Yusupova", role: "Dramaturg" },
        { text: "Qulay interfeys, tez fikr-mulohaza. Tavsiya qilaman!", name: "Temur Nazarov", role: "Rejissyor" },
      ],
    },
    blog: {
      title: "Blog", sub: "Maslahatlar, yangiliklar va ilhom",
      items: [
        { tag: "Master-klass", title: "Ssenariyda yaxshi dialog uchun 10 qoida", date: "28 May 2025", min: "7 daq" },
        { tag: "Yangiliklar", title: "Emerald Empire mentorlik dasturini ishga tushirmoqda", date: "15 May 2025", min: "4 daq" },
        { tag: "Maslahatlar", title: "2025 yilda ssenariylarni qanday monetizatsiya qilish", date: "2 May 2025", min: "9 daq" },
      ],
    },
    contact: {
      title: "Aloqa", sub: "Biz bilan bog'laning",
      name: "Ismingiz", email: "Email", message: "Xabar", send: "Yuborish",
      or: "Yoki bizni ijtimoiy tarmoqlarda toping",
    },
    auth: {
      title: "Hisobga kirish", email: "Email", pass: "Parol",
      code: "Xatdan kod", btn: "Kirish",
      step2: "Tasdiqlash kodini kiriting", resend: "Kodni qayta yuborish",
      noAcc: "Hisob yo'qmi? Ro'yxatdan o'tish",
    },
    footer: { copy: "© 2025 Emerald Empire Studio. Barcha huquqlar himoyalangan.", lang: "Til" },
    tournaments: {
      title: "Turnirlar",
      bookTitle: "Turnir bron qilish",
      bookSub: "Platformamizda o'z turniringizni tashkil qiling",
      registerTitle: "Joy ro'yxatdan o'tish",
      registerSub: "Turnirda ishtirok eting",
      bookBtn: "Turnir bron qilish",
      registerBtn: "Joy ro'yxatdan o'tish",
      form: { nick: "Roblox nomi", age: "Yosh", stand: "Stend + Uslub", submit: "Ariza yuborish", success: "Ariza yuborildi!" },
      slots: ["10:00–12:00", "12:00–14:00", "14:00–16:00", "16:00–18:00", "18:00–20:00"],
      maxPlayers: "Maksimal 18 ishtirokchi",
      bookPrices: ["$13.66 — Asosiy", "$34.15 — Standart", "$68.30 — Premium"],
      regPrices: ["$13.66 — Asosiy", "$34.15 — Standart", "$68.30 — Premium"],
      paymentNote: "Bog'langan karta talab qilinadi.", addCard: "Karta bog'lash",
      bookingRules: "Bron qilish 36 soatdan oldin.",
      back: "← Orqaga", tabBook: "📋 Tashkilotchilar", tabRegister: "🏆 Ishtirokchilar",
    },
    dashboard: {
      title: "Shaxsiy kabinet",
      uploadAvatar: "Rasm yuklash",
      subscriptions: "Obunalar",
      themes: "Mavzular",
      settings: "Sozlamalar",
      monetization: "Monetizatsiya",
      plans: [
        { price: "$3.70/oy", pages: "40 sahifagacha", times: "Oyda 1 marta" },
        { price: "$7.30/oy", pages: "100 sahifagacha", times: "Oyda 3 marta" },
        { price: "$16.79/oy yoki $108 umrbod", pages: "200 sahifagacha", times: "Oyda 5 marta" },
        { price: "$32.85/oy", pages: "500 sahifagacha", times: "Oyda 30 marta" },
      ],
      subscribe: "Obuna bo'lish", currentPlan: "Joriy tarif",
      monet: {
        title: "Monetizatsiya",
        sub: "To'lovlarni qabul qilish uchun karta bog'lang",
        addCard: "To'lov karatasini bog'lash",
        pending: "Karta administrator tomonidan tekshirilmoqda",
        approved: "Karta tasdiqlandi ✓",
        rejected: "Karta rad etildi. Qo'llab-quvvatlash bilan bog'laning.",
        note: "Monetizatsiya kartasi to'lov kartasi bilan bir xil bo'lishi mumkin emas.",
        cardNum: "Karta raqami",
        expiry: "OO/YY",
        submit: "Tekshirishga yuborish",
      },
    },
    games: {
      title: "O'yinlar", sub: "14 brauzer o'yini (6 daraja)",
      list: GAME_LIST,
      back: "← O'yinlarga",
      start: "Space yoki tegish", over: "O'yin tugadi", score: "Ball", best: "Rekord", restart: "Qayta",
    },
    forum: {
      title: "Forum", sub: "G'oyalar va muloqot",
      newPost: "Yangi mavzu", searchPh: "Teglar bo'yicha qidirish...",
      filters: ["Hammasi", "G'oyalar", "Savollar", "E'lonlar", "Boshqa"],
      postTitle: "Mavzu sarlavhasi", postBody: "Matn...", postTag: "Teg",
      submit: "E'lon qilish", cancel: "Bekor qilish",
      reply: "Javob berish", replies: "javob",
      bannedMsg: "Hisobingiz cheklangan. Faqat administrator bilan muloqot qilishingiz mumkin.",
      linkWarn: "Havolalar taqiqlangan. Sharh o'chirildi.",
    },
  },
  EN: {
    nav: {
      home: "Home", about: "About", portfolio: "Portfolio",
      scripts: "Scripts", blog: "Blog", contact: "Contact",
      login: "Login", tournaments: "Tournaments", games: "Games",
      dashboard: "Dashboard", forum: "Forum",
    },
    hero: {
      tag: "Premium Screenwriters Studio",
      title: "EMERALD\nEMPIRE",
      subtitle: "Craft stories that change the world. Write, publish and monetize your screenplays on one platform.",
      cta: "Begin Your Journey", cta2: "View Portfolio",
    },
    about: {
      title: "About the Studio", sub: "We are a team of professional screenwriters and producers",
      p1: "Emerald Empire is a premium platform for content creators: screenwriters, directors and producers.",
      p2: "Since 2020 we've helped over 500 authors find their audience and monetize their work.",
      stats: [{ n: "500+", l: "Authors" }, { n: "1200+", l: "Scripts" }, { n: "3", l: "Languages" }, { n: "98%", l: "Satisfied" }],
    },
    portfolio: {
      title: "Portfolio", sub: "Selected works by our authors",
      items: [
        { title: "Shadows Over the City", genre: "Thriller", author: "A. Ivanov", year: "2024" },
        { title: "The Last Dawn", genre: "Drama", author: "M. Sadykov", year: "2024" },
        { title: "Parallel Worlds", genre: "Sci-Fi", author: "L. Kim", year: "2023" },
        { title: "Code of Silence", genre: "Detective", author: "N. Petrov", year: "2023" },
        { title: "Voice of the Desert", genre: "Documentary", author: "Z. Aliyev", year: "2024" },
        { title: "Thread of Fate", genre: "Drama", author: "O. Yusupova", year: "2023" },
      ],
    },
    scripts: {
      title: "Scripts", sub: "Upload, search and discuss",
      search: "Search scripts...", upload: "Upload Script",
      filters: ["All", "Thriller", "Drama", "Sci-Fi", "Detective"],
      items: [
        { title: "Shadows Over the City", genre: "Thriller", pages: 94, price: "Free", author: "A. Ivanov", comments: 12 },
        { title: "Parallel Worlds", genre: "Sci-Fi", pages: 108, price: "500 UZS", author: "L. Kim", comments: 8 },
        { title: "The Last Dawn", genre: "Drama", pages: 87, price: "Free", author: "M. Sadykov", comments: 21 },
        { title: "Code of Silence", genre: "Detective", pages: 102, price: "750 UZS", author: "N. Petrov", comments: 5 },
      ],
      paidLabel: "Paid access", freeLabel: "Free",
      priceHint: "Amount in USD. ≤$8 — no commission, >$8 — 5% commission.",
      needCard: "Publishing paid scripts requires a linked monetization card.",
    },
    reviews: {
      title: "Reviews", sub: "What our authors say",
      items: [
        { text: "Emerald Empire gave me the opportunity to reach an international level. Excellent platform!", name: "Alisher Karimov", role: "Screenwriter" },
        { text: "Finally a place that values quality storytelling. My work found its audience.", name: "Malika Yusupova", role: "Playwright" },
        { text: "Great interface, fast feedback, responsive team. Highly recommend!", name: "Timur Nazarov", role: "Director" },
      ],
    },
    blog: {
      title: "Blog", sub: "Tips, news and inspiration",
      items: [
        { tag: "Masterclass", title: "10 Rules for Great Dialogue in a Screenplay", date: "May 28, 2025", min: "7 min" },
        { tag: "News", title: "Emerald Empire Launches Mentorship Programme", date: "May 15, 2025", min: "4 min" },
        { tag: "Tips", title: "How to Monetize Your Scripts in 2025", date: "May 2, 2025", min: "9 min" },
      ],
    },
    contact: {
      title: "Contact", sub: "Get in touch",
      name: "Your name", email: "Email", message: "Message", send: "Send",
      or: "Or find us on social media",
    },
    auth: {
      title: "Sign In", email: "Email", pass: "Password",
      code: "Code from email", btn: "Sign In",
      step2: "Enter verification code", resend: "Resend code",
      noAcc: "No account? Register",
    },
    footer: { copy: "© 2025 Emerald Empire Studio. All rights reserved.", lang: "Language" },
    tournaments: {
      title: "Tournaments",
      bookTitle: "Book a Tournament",
      bookSub: "Organize your own tournament on our platform",
      registerTitle: "Register a Slot",
      registerSub: "Join a tournament as a participant",
      bookBtn: "Book a Tournament",
      registerBtn: "Register a Slot",
      form: { nick: "Roblox nickname", age: "Age", stand: "Stand + Style", submit: "Submit", success: "Registration submitted!" },
      slots: ["10:00–12:00", "12:00–14:00", "14:00–16:00", "16:00–18:00", "18:00–20:00"],
      maxPlayers: "Maximum 18 participants",
      bookPrices: ["$13.66 — Basic", "$34.15 — Standard", "$68.30 — Premium"],
      regPrices: ["$13.66 — Basic", "$34.15 — Standard", "$68.30 — Premium"],
      paymentNote: "A linked payment card is required.", addCard: "Add Card",
      bookingRules: "Booking must be made at least 36 hours before start.",
      back: "← Back", tabBook: "📋 Organizers", tabRegister: "🏆 Participants",
    },
    dashboard: {
      title: "Dashboard",
      uploadAvatar: "Upload Photo",
      subscriptions: "Subscriptions",
      themes: "Themes",
      settings: "Settings",
      monetization: "Monetization",
      plans: [
        { price: "$3.70/mo", pages: "Up to 40 pages", times: "1× per month" },
        { price: "$7.30/mo", pages: "Up to 100 pages", times: "3× per month" },
        { price: "$16.79/mo or $108 lifetime", pages: "Up to 200 pages", times: "5× per month" },
        { price: "$32.85/mo", pages: "Up to 500 pages", times: "30× per month" },
      ],
      subscribe: "Subscribe", currentPlan: "Current plan",
      monet: {
        title: "Monetization",
        sub: "Link a card to receive payouts",
        addCard: "Add payout card",
        pending: "Card pending admin review",
        approved: "Card approved ✓",
        rejected: "Card rejected. Contact support.",
        note: "Monetization card cannot be the same as your payment card.",
        cardNum: "Card number",
        expiry: "MM/YY",
        submit: "Submit for review",
      },
    },
    games: {
      title: "Games", sub: "14 browser games (6 levels, except Flappy)",
      list: GAME_LIST,
      back: "← Games",
      start: "Press Space or tap to start",
      over: "Game Over", score: "Score", best: "Best", restart: "Restart",
    },
    forum: {
      title: "Forum", sub: "Ideas and discussion",
      newPost: "New Topic", searchPh: "Search by tags...",
      filters: ["All", "Ideas", "Questions", "Announcements", "Other"],
      postTitle: "Topic title", postBody: "Text...", postTag: "Tag",
      submit: "Post", cancel: "Cancel",
      reply: "Reply", replies: "replies",
      bannedMsg: "Your account is restricted. You can only chat with the admin.",
      linkWarn: "Links are not allowed. Comment removed.",
    },
  },
};

// ── Icons ────────────────────────────────────────────────────
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }} aria-hidden="true">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }} aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

// ── Particle Canvas ──────────────────────────────────────────
function ParticleCanvas({ accent }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const color = accent || "#00FF00";
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color + "80"; ctx.fill();
      });
      pts.forEach((a, i) => pts.slice(i + 1).forEach((b) => {
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = color + Math.round(0.18 * (1 - d / 120) * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [accent]);
  return <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ── Language Switcher — идеальный круг ───────────────────────
function LangSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const others = ["RU", "UZ", "EN"].filter((l) => l !== lang);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox" aria-expanded={open} aria-label={`Language: ${lang}`}
        style={{
          width: 40, height: 40, borderRadius: "50%", border: "2px solid var(--teal)",
          background: "var(--card)", color: "var(--teal)",
          fontFamily: "Orbitron, monospace", fontSize: 10, fontWeight: 700,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s", letterSpacing: "0.02em",
        }}
      >
        {lang}
      </button>
      {open && (
        <div role="listbox" aria-label="Select language" style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 8, overflow: "hidden", zIndex: 300, minWidth: 48,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          {others.map((l) => (
            <button key={l} role="option" aria-selected={false}
              onClick={() => { setLang(l); setOpen(false); }}
              style={{
                display: "flex", width: "100%", alignItems: "center", justifyContent: "center",
                height: 40, border: "none", borderBottom: "1px solid var(--border)",
                background: "transparent", color: "var(--silver)",
                fontFamily: "Orbitron, monospace", fontSize: 10, fontWeight: 700,
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.target.style.background = "var(--border)"}
              onMouseLeave={(e) => e.target.style.background = "transparent"}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Theme Toggle ─────────────────────────────────────────────
function ThemeToggle({ theme, setTheme }) {
  const idx = THEME_IDS.indexOf(theme);
  const next = THEME_IDS[(idx + 1) % THEME_IDS.length];
  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`${THEMES[theme]?.label} → ${THEMES[next]?.label}`}
      style={{
        width: 40, height: 40, borderRadius: "50%", border: "2px solid var(--teal)",
        background: "var(--card)", fontSize: 18, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s", flexShrink: 0,
      }}
    >
      {THEMES[theme].icon}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── GAMES ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════

// ── 1. Flappy Emerald ────────────────────────────────────────
function FlappyGame({ t, theme }) {
  const canvasRef = useRef(null);
  const state = useRef({ bird: { y: 200, vy: 0 }, pipes: [], score: 0, best: 0, frame: 0, running: false, over: false });
  const [display, setDisplay] = useState({ score: 0, best: 0, over: false, started: false });
  const rafRef = useRef(null);
  const W = 400, H = 500, GAP = 160, PIPE_W = 50, SPEED = 2.5;
  const BG = theme === "dark" ? "#000" : "#e8f5e9";
  const PIPE_COLOR = theme === "dark" ? "#00FF00" : "#046307";
  const BIRD_COLOR = theme === "dark" ? "#00FF00" : "#34D399";

  const reset = () => {
    state.current = { bird: { y: 200, vy: 0 }, pipes: [], score: 0, best: state.current.best, frame: 0, running: false, over: false };
    setDisplay({ score: 0, best: state.current.best, over: false, started: false });
  };

  const flap = useCallback(() => {
    const s = state.current;
    if (s.over) { reset(); return; }
    if (!s.running) { s.running = true; setDisplay(d => ({ ...d, started: true })); }
    s.bird.vy = -8;
  }, []);

  useEffect(() => {
    reset();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const onKey = (e) => { if (e.code === "Space") { e.preventDefault(); flap(); } };
    window.addEventListener("keydown", onKey);

    const loop = () => {
      const s = state.current;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      if (s.running && !s.over) {
        s.bird.vy += 0.45; s.bird.y += s.bird.vy; s.frame++;
        if (s.frame % 90 === 0) {
          const top = 60 + Math.random() * (H - GAP - 120);
          s.pipes.push({ x: W, top });
        }
        s.pipes.forEach(p => p.x -= SPEED);
        s.pipes = s.pipes.filter(p => p.x > -PIPE_W);
        s.pipes.forEach(p => { if (p.x + PIPE_W === Math.floor(W / 2)) s.score++; });
        if (s.score > s.best) s.best = s.score;
        setDisplay({ score: s.score, best: s.best, over: s.over, started: s.running });
      }
      // Draw pipes
      ctx.fillStyle = PIPE_COLOR;
      s.pipes.forEach(p => {
        ctx.fillRect(p.x, 0, PIPE_W, p.top);
        ctx.fillRect(p.x, p.top + GAP, PIPE_W, H - p.top - GAP);
        ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(p.x, p.top - 20, PIPE_W, 20); ctx.fillRect(p.x, p.top + GAP, PIPE_W, 20);
        ctx.fillStyle = PIPE_COLOR;
      });
      // Draw bird
      ctx.beginPath(); ctx.arc(W / 2, s.bird.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = BIRD_COLOR; ctx.fill();
      ctx.beginPath(); ctx.arc(W / 2 + 5, s.bird.y - 4, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff"; ctx.fill();
      ctx.beginPath(); ctx.arc(W / 2 + 6, s.bird.y - 4, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#000"; ctx.fill();
      // Score
      ctx.font = "bold 24px Orbitron, monospace"; ctx.fillStyle = PIPE_COLOR;
      ctx.textAlign = "center"; ctx.fillText(s.score, W / 2, 40);
      // Hit check
      const hit = s.bird.y < 10 || s.bird.y > H - 10 || s.pipes.some(p =>
        Math.abs(W / 2 - (p.x + PIPE_W / 2)) < 14 + PIPE_W / 2 &&
        (s.bird.y < p.top + 14 || s.bird.y > p.top + GAP - 14)
      );
      if (hit && s.running) {
        s.running = false; s.over = true;
        setDisplay(d => ({ ...d, over: true }));
        ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(0, 0, W, H);
        ctx.font = "bold 28px Orbitron, monospace"; ctx.fillStyle = PIPE_COLOR;
        ctx.fillText(t.games.over, W / 2, H / 2 - 20);
        ctx.font = "16px Exo 2, sans-serif"; ctx.fillStyle = "#fff";
        ctx.fillText(`${t.games.score}: ${s.score}`, W / 2, H / 2 + 20);
      }
      if (!s.running && !s.over) {
        ctx.font = "14px Exo 2, sans-serif"; ctx.fillStyle = PIPE_COLOR;
        ctx.fillText(t.games.start, W / 2, H / 2);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("keydown", onKey); };
  }, [theme]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <canvas ref={canvasRef} width={W} height={H} onClick={flap}
        role="application" aria-label="Flappy Emerald game" tabIndex={0}
        style={{ borderRadius: 12, border: "2px solid var(--teal)", cursor: "pointer", maxWidth: "100%", boxShadow: "0 0 32px rgba(0,255,0,0.15)" }} />
      <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>{t.games.best}: {display.best}</p>
    </div>
  );
}

// ── 2. Memory Cards ──────────────────────────────────────────
const EMOJI_POOL = ["🎬", "📝", "🎭", "🎥", "📖", "🏆", "🌟", "💡"];
function MemoryGame({ t, theme }) {
  const createDeck = () => {
    const cards = [...EMOJI_POOL, ...EMOJI_POOL].map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
    return cards.sort(() => Math.random() - 0.5);
  };
  const [cards, setCards] = useState(createDeck);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    if (selected.length === 2) {
      const [a, b] = selected;
      if (cards[a].emoji === cards[b].emoji) {
        setCards(c => c.map((card, i) => i === a || i === b ? { ...card, matched: true } : card));
        setSelected([]);
        if (cards.filter(c => c.matched).length + 2 === cards.length) setWon(true);
      } else {
        const t = setTimeout(() => {
          setCards(c => c.map((card, i) => i === a || i === b ? { ...card, flipped: false } : card));
          setSelected([]);
        }, 900);
        return () => clearTimeout(t);
      }
    }
  }, [selected]);

  const flip = (i) => {
    if (selected.length === 2 || cards[i].flipped || cards[i].matched) return;
    setCards(c => c.map((card, idx) => idx === i ? { ...card, flipped: true } : card));
    setSelected(s => [...s, i]);
    setMoves(m => m + 1);
  };

  const restart = () => { setCards(createDeck()); setSelected([]); setMoves(0); setWon(false); };

  const cardBg = theme === "dark" ? "#003300" : "#d1fae5";
  const cardFlip = theme === "dark" ? "#00FF00" : "#046307";

  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "var(--teal)", marginBottom: 16, fontFamily: "Exo 2, sans-serif" }}>{t.games.score}: {moves}</p>
      {won && <div style={{ color: "var(--teal)", fontFamily: "Orbitron, monospace", fontSize: 20, marginBottom: 16 }}>🏆 Win! ({moves} moves)</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, maxWidth: 360, margin: "0 auto" }}>
        {cards.map((card, i) => (
          <button key={card.id} onClick={() => flip(i)}
            style={{
              width: 72, height: 72, borderRadius: 10, border: "2px solid var(--teal)", fontSize: 28,
              cursor: "pointer", transition: "all 0.2s",
              background: card.flipped || card.matched ? cardFlip : cardBg,
              color: card.flipped || card.matched ? (theme === "dark" ? "#000" : "#fff") : "transparent",
            }}>
            {card.flipped || card.matched ? card.emoji : "?"}
          </button>
        ))}
      </div>
      <button className="btn-outline" onClick={restart} style={{ marginTop: 20 }}>{t.games.restart}</button>
    </div>
  );
}

// ── 3. Type Racer ────────────────────────────────────────────
const PHRASES = [
  "The screenplay is the blueprint of the film.",
  "Every great story begins with a single idea.",
  "Write characters that breathe and bleed.",
  "Show don't tell is the golden rule of cinema.",
  "Conflict drives every compelling narrative forward.",
];
function TypeRacer({ t, theme }) {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)]);
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState(null);
  const [done, setDone] = useState(false);

  const wpm = start && done ? Math.round((phrase.split(" ").length / ((Date.now() - start) / 60000))) : 0;

  const handleChange = (e) => {
    const val = e.target.value;
    if (!start) setStart(Date.now());
    setTyped(val);
    if (val === phrase) setDone(true);
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20, lineHeight: 2, fontFamily: "Exo 2, sans-serif", fontSize: 16, textAlign: "left" }}>
        {phrase.split("").map((ch, i) => (
          <span key={i} style={{
            color: i < typed.length ? (typed[i] === ch ? "var(--teal)" : "#ff4444") : "var(--silver)",
            background: i === typed.length ? "var(--teal)" + "44" : "transparent",
          }}>{ch}</span>
        ))}
      </div>
      {!done ? (
        <input
          value={typed} onChange={handleChange} autoFocus
          placeholder="Start typing..."
          style={{ width: "100%", background: "var(--card)", border: "2px solid var(--teal)", borderRadius: 8, padding: "12px 16px", color: "var(--silver)", fontFamily: "Exo 2, sans-serif", fontSize: 15, outline: "none" }}
        />
      ) : (
        <div>
          <div style={{ color: "var(--teal)", fontFamily: "Orbitron, monospace", fontSize: 24, marginBottom: 8 }}>🏁 {wpm} WPM</div>
          <button className="btn-outline" onClick={() => window.location.reload()}>{t.games.restart}</button>
        </div>
      )}
    </div>
  );
}

// ── 4. Script Quiz ───────────────────────────────────────────
const QUIZ_Q = [
  { q: "What is a logline?", opts: ["A one-sentence story summary", "A camera shot", "A budget line", "A film genre"], a: 0 },
  { q: "What does 'INT.' mean in a script?", opts: ["Interior scene", "International film", "Intense moment", "Intro sequence"], a: 0 },
  { q: "What is the Three-Act Structure?", opts: ["Setup, Confrontation, Resolution", "Beginning, Middle, End, Epilogue", "Opening, Climax, Credits", "Premise, Rising Action, Falling Action"], a: 0 },
  { q: "Who writes the shooting script?", opts: ["The screenwriter", "The director", "The producer", "The editor"], a: 0 },
  { q: "What is a beat in screenwriting?", opts: ["A pause or story moment", "A musical note", "A scene heading", "A character action"], a: 0 },
];
function ScriptQuiz({ t, theme }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);

  const answer = (i) => {
    if (chosen !== null) return;
    setChosen(i);
    if (i === QUIZ_Q[idx].a) setScore(s => s + 1);
    setTimeout(() => {
      if (idx + 1 >= QUIZ_Q.length) setDone(true);
      else { setIdx(x => x + 1); setChosen(null); }
    }, 900);
  };

  if (done) return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
      <div style={{ fontFamily: "Orbitron, monospace", fontSize: 22, color: "var(--teal)", marginBottom: 8 }}>{score}/{QUIZ_Q.length}</div>
      <button className="btn-outline" onClick={() => { setIdx(0); setScore(0); setChosen(null); setDone(false); }}>{t.games.restart}</button>
    </div>
  );

  const q = QUIZ_Q[idx];
  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <p style={{ color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: 12, marginBottom: 8 }}>{idx + 1} / {QUIZ_Q.length}</p>
      <p style={{ fontFamily: "Orbitron, monospace", fontSize: 16, color: "var(--silver)", marginBottom: 24, lineHeight: 1.5 }}>{q.q}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, i) => {
          let bg = "var(--card)";
          if (chosen !== null) { if (i === q.a) bg = "#00ff0033"; else if (i === chosen) bg = "#ff444433"; }
          return (
            <button key={i} onClick={() => answer(i)}
              style={{ background: bg, border: "1px solid var(--border)", borderRadius: 8, padding: "12px 20px", color: "var(--silver)", fontFamily: "Exo 2, sans-serif", fontSize: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 5. Snake ─────────────────────────────────────────────────
function SnakeGame({ t, theme }) {
  const canvasRef = useRef(null);
  const S = 20, W = 400, H = 400;
  const state = useRef({ snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, food: { x: 15, y: 15 }, score: 0, alive: true });
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const SNAKE_COLOR = theme === "dark" ? "#00FF00" : "#046307";
  const FOOD_COLOR = theme === "dark" ? "#7C3AED" : "#34D399";
  const BG = theme === "dark" ? "#000" : "#e8f5e9";

  const restart = () => { state.current = { snake: [{ x: 10, y: 10 }], dir: { x: 1, y: 0 }, food: { x: 15, y: 15 }, score: 0, alive: true }; setScore(0); setOver(false); };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const onKey = (e) => {
      const d = state.current.dir;
      if (e.key === "ArrowUp" && d.y !== 1) state.current.dir = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && d.y !== -1) state.current.dir = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && d.x !== 1) state.current.dir = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && d.x !== -1) state.current.dir = { x: 1, y: 0 };
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    const interval = setInterval(() => {
      const s = state.current;
      if (!s.alive) return;
      const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
      if (head.x < 0 || head.x >= W / S || head.y < 0 || head.y >= H / S || s.snake.some(b => b.x === head.x && b.y === head.y)) { s.alive = false; setOver(true); return; }
      s.snake.unshift(head);
      if (head.x === s.food.x && head.y === s.food.y) {
        s.score++; setScore(s.score);
        s.food = { x: Math.floor(Math.random() * (W / S)), y: Math.floor(Math.random() * (H / S)) };
      } else s.snake.pop();
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = FOOD_COLOR; ctx.fillRect(s.food.x * S + 2, s.food.y * S + 2, S - 4, S - 4);
      s.snake.forEach((b, i) => { ctx.fillStyle = i === 0 ? SNAKE_COLOR : SNAKE_COLOR + "cc"; ctx.fillRect(b.x * S + 1, b.y * S + 1, S - 2, S - 2); });
    }, 120);
    return () => { clearInterval(interval); window.removeEventListener("keydown", onKey); };
  }, [theme]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p style={{ color: "var(--teal)", marginBottom: 12, fontFamily: "Exo 2, sans-serif" }}>{t.games.score}: {score}</p>
      {over && <div style={{ color: "var(--teal)", fontFamily: "Orbitron, monospace", marginBottom: 12 }}>{t.games.over}</div>}
      <canvas ref={canvasRef} width={W} height={H} tabIndex={0}
        style={{ borderRadius: 12, border: "2px solid var(--teal)", display: "block" }} />
      <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>Arrow keys to move</p>
      {over && <button className="btn-outline" onClick={restart} style={{ marginTop: 12 }}>{t.games.restart}</button>}
    </div>
  );
}

// ── 6. Brick Breaker ─────────────────────────────────────────
function BrickBreaker({ t, theme }) {
  const canvasRef = useRef(null);
  const W = 400, H = 480;
  const BRICK_COLOR = theme === "dark" ? "#00FF00" : "#046307";
  const BALL_COLOR = theme === "dark" ? "#7C3AED" : "#34D399";
  const PAD_COLOR = theme === "dark" ? "#00FF00" : "#046307";
  const BG = theme === "dark" ? "#000" : "#e8f5e9";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let ball = { x: 200, y: 300, vx: 3, vy: -3, r: 8 };
    let pad = { x: 150, w: 80, y: H - 24 };
    let bricks = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) bricks.push({ x: c * 48 + 4, y: r * 28 + 40, w: 44, h: 20, alive: true });
    let score = 0, alive = true;

    const onMove = (e) => { const rect = canvas.getBoundingClientRect(); pad.x = e.clientX - rect.left - pad.w / 2; };
    canvas.addEventListener("mousemove", onMove);

    let raf;
    const loop = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy *= -1;
      if (ball.y > H) { alive = false; ctx.fillStyle = "#ff4444"; ctx.font = "20px Orbitron, monospace"; ctx.textAlign = "center"; ctx.fillText(t.games.over, W / 2, H / 2); return; }
      if (ball.y > pad.y - ball.r && ball.x > pad.x && ball.x < pad.x + pad.w) ball.vy = -Math.abs(ball.vy);
      bricks.forEach(b => {
        if (!b.alive) return;
        if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) { b.alive = false; ball.vy *= -1; score++; }
      });
      ctx.fillStyle = PAD_COLOR; ctx.fillRect(pad.x, pad.y, pad.w, 12);
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fillStyle = BALL_COLOR; ctx.fill();
      bricks.forEach(b => { if (b.alive) { ctx.fillStyle = BRICK_COLOR; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(b.x, b.y + b.h - 4, b.w, 4); } });
      ctx.font = "14px Orbitron, monospace"; ctx.fillStyle = BRICK_COLOR; ctx.textAlign = "center";
      ctx.fillText(`${t.games.score}: ${score}`, W / 2, 24);
      if (alive) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("mousemove", onMove); };
  }, [theme]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <canvas ref={canvasRef} width={W} height={H}
        style={{ borderRadius: 12, border: "2px solid var(--teal)", cursor: "none" }} />
      <p style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>Move mouse to control paddle</p>
    </div>
  );
}

// ── 7. Wordle ────────────────────────────────────────────────
const WORDS = ["SCENE", "DRAMA", "STORY", "GENRE", "PILOT", "SHOTS", "ANGLE", "ACTOR"];
function WordleGame({ t, theme }) {
  const [word] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [done, setDone] = useState(false);
  const MAX = 6;

  const submit = () => {
    if (current.length !== 5) return;
    const newGuesses = [...guesses, current.toUpperCase()];
    setGuesses(newGuesses);
    setCurrent("");
    if (current.toUpperCase() === word || newGuesses.length >= MAX) setDone(true);
  };

  const getTileColor = (guess, i) => {
    const ch = guess[i];
    if (ch === word[i]) return theme === "dark" ? "#005500" : "#34D399";
    if (word.includes(ch)) return theme === "dark" ? "#554400" : "#fbbf24";
    return "var(--card)";
  };

  return (
    <div style={{ textAlign: "center", maxWidth: 340, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {Array.from({ length: MAX }).map((_, row) => (
          <div key={row} style={{ display: "flex", gap: 6, justifyContent: "center" }}>
            {Array.from({ length: 5 }).map((_, col) => {
              const guess = guesses[row];
              const ch = guess ? guess[col] : (row === guesses.length ? current[col] : "");
              return (
                <div key={col} style={{ width: 52, height: 52, border: "2px solid var(--teal)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: guess ? getTileColor(guess, col) : "var(--card)", fontFamily: "Orbitron, monospace", fontSize: 20, fontWeight: 700, color: "var(--silver)", transition: "background 0.3s" }}>
                  {ch || ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {!done ? (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <input value={current} onChange={e => setCurrent(e.target.value.slice(0, 5).toUpperCase())}
            onKeyDown={e => e.key === "Enter" && submit()}
            maxLength={5} placeholder="TYPE" autoFocus
            style={{ background: "var(--card)", border: "2px solid var(--teal)", borderRadius: 8, padding: "10px 14px", color: "var(--silver)", fontFamily: "Orbitron, monospace", fontSize: 18, letterSpacing: "0.3em", width: 160, textAlign: "center", outline: "none" }} />
          <button className="btn-primary" onClick={submit}>→</button>
        </div>
      ) : (
        <div>
          <div style={{ color: "var(--teal)", fontFamily: "Orbitron, monospace", fontSize: 20, marginBottom: 8 }}>
            {guesses[guesses.length - 1] === word ? "🎉 WIN!" : `❌ ${word}`}
          </div>
          <button className="btn-outline" onClick={() => window.location.reload()}>{t.games.restart}</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── TOURNAMENTS — split into two sections ──────────────────────
// ═══════════════════════════════════════════════════════════════
const DISCORD_URL = "https://discord.gg/emerald-empire";

function TournamentFlow({ type, t, lang, isGuest }) {
  const d = t.tournaments;
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [price, setPrice] = useState(null);

  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const day = new Date(today); day.setDate(today.getDate() + i + 1); return day;
  });
  const canBook = (day, sl) => {
    const [hh, mm] = sl.split("–")[0].split(":").map(Number);
    const target = new Date(day); target.setHours(hh, mm, 0, 0);
    return target - new Date() >= 36 * 3600 * 1000;
  };
  const prices = type === "book" ? d.bookPrices : [];
  const title = type === "book" ? d.bookTitle : d.registerTitle;
  const sub = type === "book" ? d.bookSub : d.registerSub;

  if (type === "register" && isGuest) {
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>{d.guestBlock}</p>
      </div>
    );
  }

  const canProceedStep0 = type === "book" ? slot && price : slot;

  return (
    <div>
      <h3 style={{ fontFamily: "Orbitron, monospace", fontSize: 18, color: "var(--teal)", marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: 13, marginBottom: 12 }}>{sub}</p>
      <p style={{ color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: 12, marginBottom: 24 }}>
        {type === "book" ? d.bookNoForm : d.regFree}
      </p>

      {step === 0 && (
        <>
          <div style={{ overflowX: "auto", marginBottom: 28 }}>
            <div style={{ display: "flex", gap: 10, paddingBottom: 8, minWidth: "max-content" }}>
              {days.map((day, i) => (
                <button key={i} onClick={() => setDate(day)} aria-pressed={date?.toDateString() === day.toDateString()}
                  style={{ background: date?.toDateString() === day.toDateString() ? "var(--teal)" : "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", cursor: "pointer", color: date?.toDateString() === day.toDateString() ? "#000" : "var(--silver)", fontFamily: "Exo 2, sans-serif", minWidth: 68, textAlign: "center", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>{day.toLocaleDateString(lang === "RU" ? "ru-RU" : "en-US", { weekday: "short" })}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{day.getDate()}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{day.toLocaleDateString(undefined, { month: "short" })}</div>
                </button>
              ))}
            </div>
          </div>

          {date && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {d.slots.map((sl, i) => {
                  const ok = canBook(date, sl);
                  return (
                    <button key={i} disabled={!ok} onClick={() => setSlot(sl)} aria-pressed={slot === sl}
                      style={{ background: slot === sl ? "var(--teal)" : ok ? "var(--card)" : "rgba(0,0,0,0.05)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 16px", cursor: ok ? "pointer" : "not-allowed", color: slot === sl ? "#000" : ok ? "var(--silver)" : "var(--text-muted)", fontFamily: "Exo 2, sans-serif", fontSize: 13, opacity: ok ? 1 : 0.5, transition: "all 0.2s" }}>
                      {sl}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>⚠ {d.bookingRules}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 16 }}>👥 {d.maxPlayers}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                {prices.map((p, i) => (
                  <button key={i} onClick={() => setPrice(p)} aria-pressed={price === p}
                    style={{ background: price === p ? "var(--teal)" : "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 20px", cursor: "pointer", color: price === p ? "#000" : "var(--silver)", fontFamily: "Exo 2, sans-serif", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
                    {p}
                  </button>
                ))}
              </div>
              {canProceedStep0 && (
                <button type="button" className="btn-primary" onClick={() => setStep(type === "book" ? 2 : 1)}>
                  {type === "book" ? d.bookBtn : d.registerBtn} →
                </button>
              )}
            </>
          )}
        </>
      )}

      {step === 1 && type === "register" && (
        <div style={{ maxWidth: 420 }}>
          <p style={{ color: "var(--teal)", fontFamily: "Exo 2, sans-serif", fontSize: 13, marginBottom: 20 }}>
            {date?.toLocaleDateString()} · {slot}
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, fontFamily: "Exo 2, sans-serif" }}>
            {d.form.pending}. {d.regFree}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" className="btn-outline" onClick={() => setStep(0)}>← {d.back}</button>
            <button type="button" className="btn-primary" onClick={() => {
              window.open(DISCORD_URL, "_blank", "noopener,noreferrer");
              setStep(3);
            }}>{d.form.submit}</button>
          </div>
        </div>
      )}

      {step === 2 && type === "book" && (
        <div style={{ maxWidth: 420 }}>
          <p style={{ color: "var(--teal)", fontFamily: "Exo 2, sans-serif", fontSize: 13, marginBottom: 20 }}>
            {date?.toLocaleDateString()} · {slot} · {price}
          </p>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>💳</div>
            <h3 style={{ fontFamily: "Orbitron, monospace", fontSize: 15, marginBottom: 12 }}>{d.paymentNote}</h3>
            <input className="form-input" placeholder="Card number" style={{ marginBottom: 10 }} aria-label="Card" />
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <input className="form-input" placeholder="MM/YY" aria-label="Expiry" />
              <input className="form-input" placeholder="CVV" aria-label="CVV" />
            </div>
            <button type="button" className="btn-primary" style={{ width: "100%" }} onClick={() => setStep(3)}>{d.addCard}</button>
          </div>
          <button type="button" className="btn-outline" style={{ marginTop: 16 }} onClick={() => setStep(0)}>← {d.back}</button>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{type === "register" ? "⏳" : "✅"}</div>
          <h3 style={{ fontFamily: "Orbitron, monospace", fontSize: 18, color: "var(--teal)", marginBottom: 8 }}>{d.form.success}</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: 8 }}>{date?.toLocaleDateString()} · {slot}</p>
          {type === "book" && price && <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>{price}</p>}
          {type === "register" && (
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-block", marginBottom: 20, textDecoration: "none" }}>
              {d.form.discord}
            </a>
          )}
          <button type="button" className="btn-outline" onClick={() => { setStep(0); setDate(null); setSlot(null); setPrice(null); }}>{d.back}</button>
        </div>
      )}
    </div>
  );
}

function TournamentsPage({ t, lang }) {
  const d = t.tournaments;
  const [tab, setTab] = useState("book"); // "book" | "register"
  return (
    <section style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div className="section-inner">
        <div className="section-label">Tournaments</div>
        <div className="teal-divider" />
        <h2 className="section-title">{d.title}</h2>
        <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
          <button onClick={() => setTab("book")} aria-pressed={tab === "book"}
            style={{ background: tab === "book" ? "var(--teal)" : "var(--card)", border: "2px solid var(--teal)", borderRadius: 10, padding: "14px 28px", cursor: "pointer", color: tab === "book" ? "#000" : "var(--teal)", fontFamily: "Orbitron, monospace", fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>
            {d.tabBook}
          </button>
          <button onClick={() => setTab("register")} aria-pressed={tab === "register"}
            style={{ background: tab === "register" ? "var(--teal)" : "var(--card)", border: "2px solid var(--teal)", borderRadius: 10, padding: "14px 28px", cursor: "pointer", color: tab === "register" ? "#000" : "var(--teal)", fontFamily: "Orbitron, monospace", fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>
            {d.tabRegister}
          </button>
        </div>
        <TournamentFlow type={tab} t={t} lang={lang} isGuest={!getAuthToken()} />
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── FORUM ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const SEED_POSTS = [
  { id: 1, title: "Ideas for the next platform update?", body: "Share your ideas for new features.", tag: "Ideas", author: "AlisherK", replies: [], createdAt: "2025-05-20" },
  { id: 2, title: "How to write a good logline?", body: "Need advice on writing loglines for my script.", tag: "Questions", author: "MalikaY", replies: [], createdAt: "2025-05-22" },
  { id: 3, title: "Summer Tournament Announcement", body: "The summer tournament will begin on July 1st!", tag: "Announcements", author: "Admin", replies: [], createdAt: "2025-05-25" },
];
const URL_REGEX = /https?:\/\/\S+|www\.\S+/gi;

function ForumPage({ t, isGuest }) {
  const d = t.forum;
  const guestId = getGuestId();
  const [posts, setPosts] = useState(SEED_POSTS);
  const [votes, setVotes] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(d.filters[0]);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", body: "", tag: d.filters[1] });
  const [replyText, setReplyText] = useState({});
  const [replyWarn, setReplyWarn] = useState({});
  const [open, setOpen] = useState(null);
  const isBanned = false; // в реальности из auth state

  const filteredPosts = posts.filter(p => {
    const matchTag = filter === d.filters[0] || p.tag === filter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tag.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  const voteReply = async (postId, replyId, type) => {
    const key = `${postId}-${replyId}`;
    setVotes((v) => ({ ...v, [key]: type }));
    try {
      await fetch(`${API_BASE}/forum/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) },
        body: JSON.stringify({ postId, replyId, type, guestId }),
      });
    } catch { /* local UI still works */ }
  };

  const submitPost = () => {
    if (isGuest) return;
    if (!newPost.title) return;
    setPosts(ps => [{ id: Date.now(), ...newPost, author: "You", replies: [], createdAt: new Date().toISOString().slice(0, 10) }, ...ps]);
    setCreating(false); setNewPost({ title: "", body: "", tag: d.filters[1] });
  };

  const submitReply = (postId) => {
    if (isGuest) return;
    const text = replyText[postId] || "";
    if (URL_REGEX.test(text)) { setReplyWarn(w => ({ ...w, [postId]: true })); setReplyText(r => ({ ...r, [postId]: "" })); return; }
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, replies: [...p.replies, { id: Date.now(), text, author: "You", createdAt: new Date().toISOString().slice(0, 10) }] } : p));
    setReplyText(r => ({ ...r, [postId]: "" }));
    setReplyWarn(w => ({ ...w, [postId]: false }));
  };

  if (isBanned) return (
    <section style={{ paddingTop: 100, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
        <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--silver)" }}>{d.bannedMsg}</p>
      </div>
    </section>
  );

  return (
    <section style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div className="section-inner">
        <div className="section-label">Forum</div>
        <div className="teal-divider" />
        <h2 className="section-title">{d.title}</h2>
        <p className="section-sub">{d.sub}</p>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <input className="search-input" placeholder={d.searchPh} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
          {d.filters.map(f => (
            <button key={f} className={`filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
          {!isGuest && <button type="button" className="upload-btn" onClick={() => setCreating(true)}>+ {d.newPost}</button>}
        </div>
        {isGuest && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, fontFamily: "Exo 2, sans-serif" }}>
            Гостевой режим: публикации недоступны, лайки и дизлайки — доступны.
          </p>
        )}

        {creating && !isGuest && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 28 }}>
            <input className="form-input" placeholder={d.postTitle} value={newPost.title} onChange={e => setNewPost(n => ({ ...n, title: e.target.value }))} style={{ marginBottom: 10 }} />
            <textarea className="form-input" placeholder={d.postBody} value={newPost.body} onChange={e => setNewPost(n => ({ ...n, body: e.target.value }))} style={{ marginBottom: 10, minHeight: 90 }} />
            <select className="form-input" value={newPost.tag} onChange={e => setNewPost(n => ({ ...n, tag: e.target.value }))} style={{ marginBottom: 16 }}>
              {d.filters.slice(1).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-primary" onClick={submitPost}>{d.submit}</button>
              <button className="btn-outline" onClick={() => setCreating(false)}>{d.cancel}</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredPosts.map(post => (
            <div key={post.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <span style={{ fontSize: 10, color: "var(--teal)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>{post.tag}</span>
                  <h3 style={{ fontFamily: "Orbitron, monospace", fontSize: 15, color: "var(--silver)", margin: 0 }}>{post.title}</h3>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>{post.author} · {post.createdAt}</span>
              </div>
              {post.body && <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: 13, color: "var(--text-muted)", marginTop: 10, marginBottom: 0, lineHeight: 1.6 }}>{post.body}</p>}
              <button onClick={() => setOpen(open === post.id ? null : post.id)} style={{ marginTop: 14, background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 14px", color: "var(--teal)", fontFamily: "Exo 2, sans-serif", fontSize: 12, cursor: "pointer" }}>
                💬 {post.replies.length} {d.replies} {open === post.id ? "▲" : "▼"}
              </button>
              {open === post.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  {post.replies.map(r => (
                    <div key={r.id} style={{ marginBottom: 12, fontSize: 13, fontFamily: "Exo 2, sans-serif", color: "var(--silver)" }}>
                      <span style={{ color: "var(--teal)", marginRight: 8 }}>{r.author}</span>{r.text}
                      <span style={{ color: "var(--text-muted)", marginLeft: 8, fontSize: 11 }}>{r.createdAt}</span>
                      <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                        <button type="button" className="btn-sm btn-sm-outline" onClick={() => voteReply(post.id, r.id, "like")} aria-pressed={votes[`${post.id}-${r.id}`] === "like"}>👍</button>
                        <button type="button" className="btn-sm btn-sm-outline" onClick={() => voteReply(post.id, r.id, "dislike")} aria-pressed={votes[`${post.id}-${r.id}`] === "dislike"}>👎</button>
                      </div>
                    </div>
                  ))}
                  {replyWarn[post.id] && <p style={{ color: "#ff4444", fontSize: 12, marginBottom: 8 }}>{d.linkWarn}</p>}
                  {!isGuest && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input className="form-input" placeholder={d.reply + "..."} value={replyText[post.id] || ""} onChange={e => setReplyText(r => ({ ...r, [post.id]: e.target.value }))} onKeyDown={e => e.key === "Enter" && submitReply(post.id)} style={{ flex: 1 }} />
                    <button type="button" className="btn-primary" onClick={() => submitReply(post.id)}>{d.reply}</button>
                  </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── DASHBOARD ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
function DashboardPage({ t, theme, setTheme, user, isGuest, isAdmin }) {
  const d = t.dashboard;
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [monetCard, setMonetCard] = useState({ num: "", expiry: "" });
  const [monetStatus, setMonetStatus] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const fileRef = useRef(null);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: "subscriptions", label: d.subscriptions },
    { id: "themes", label: d.themes },
    { id: "monetization", label: d.monetization },
    { id: "promo", label: d.promo },
    ...(isAdmin ? [{ id: "audit", label: d.audit }] : []),
    { id: "settings", label: d.settings },
  ];

  const activatePromo = async () => {
    try {
      const res = await fetch(`${API_BASE}/promo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
        },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminMode(true);
        setPromoMsg(d.promoOk);
      } else setPromoMsg(data.message || d.promoFail);
    } catch {
      setPromoMsg(d.promoFail);
    }
  };

  useEffect(() => {
    if (activeTab !== "audit" || !isAdmin) return;
    fetch(`${API_BASE}/audit`, { headers: { Authorization: `Bearer ${getAuthToken()}` } })
      .then((r) => r.json())
      .then(setAuditLogs)
      .catch(() => setAuditLogs([]));
  }, [activeTab, isAdmin]);

  return (
    <section style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div className="section-inner">
        <div className="section-label">Dashboard</div>
        <div className="teal-divider" />
        <h2 className="section-title">{d.title}</h2>
        {isGuest && (
          <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "Exo 2, sans-serif", fontSize: 13, color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--teal)" }}>{d.guestBadge}</strong> — {d.guestHint}
          </div>
        )}

        {/* Profile card */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 32px", flexWrap: "wrap" }}>
          <div onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: "50%", background: avatar ? "transparent" : "var(--blue)", border: "2px solid var(--teal)", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {avatar ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 32 }}>👤</span>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} />
          <div>
            <div style={{ fontFamily: "Orbitron, monospace", fontSize: 16, color: "var(--silver)", marginBottom: 4 }}>{user?.name || "Guest"} {isAdmin && <span style={{ fontSize: 10, color: "var(--purple)" }}> [{d.admin}]</span>}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", marginBottom: 8 }}>{user?.email || "guest@emerald.local"}</div>
            <button onClick={() => fileRef.current?.click()} style={{ fontSize: 11, background: "none", border: "1px solid var(--teal)", color: "var(--teal)", borderRadius: 4, padding: "4px 12px", cursor: "pointer", fontFamily: "Exo 2, sans-serif" }}>
              {d.uploadAvatar}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-pressed={activeTab === tab.id}
              style={{ background: activeTab === tab.id ? "var(--teal)" : "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 20px", cursor: "pointer", color: activeTab === tab.id ? "#000" : "var(--silver)", fontFamily: "Exo 2, sans-serif", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Subscriptions */}
        {activeTab === "subscriptions" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 }}>
            {d.plans.map((plan, i) => (
              <div key={i} onClick={() => setSelectedPlan(i)}
                style={{ background: selectedPlan === i ? "var(--teal)" : "var(--card)", border: `2px solid ${selectedPlan === i ? "var(--teal)" : "var(--border)"}`, borderRadius: 12, padding: "24px 20px", cursor: "pointer", transition: "all 0.3s", color: selectedPlan === i ? "#000" : "var(--silver)" }}>
                <div style={{ fontFamily: "Orbitron, monospace", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{plan.price}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: 13, marginBottom: 6, opacity: 0.8 }}>{plan.pages}</div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: 12, opacity: 0.65 }}>{plan.times}</div>
                {selectedPlan === i && <div style={{ marginTop: 14, fontFamily: "Exo 2, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>✓ {d.currentPlan}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Themes */}
        {activeTab === "themes" && (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {Object.values(THEMES).map(th => (
              <button key={th.id} onClick={() => setTheme(th.id)}
                style={{ background: th.vars["--bg"], border: `3px solid ${theme === th.id ? "var(--teal)" : "var(--border)"}`, borderRadius: 12, padding: "24px 32px", cursor: "pointer", color: th.vars["--silver"], fontFamily: "Orbitron, monospace", fontSize: 13, transition: "all 0.3s", minWidth: 160 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{th.icon}</div>
                <div>{th.label}</div>
                {theme === th.id && <div style={{ fontSize: 10, marginTop: 8, color: th.vars["--teal"] }}>ACTIVE</div>}
              </button>
            ))}
          </div>
        )}

        {/* Monetization */}
        {activeTab === "monetization" && isGuest && (
          <p style={{ color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>{d.guestHint}</p>
        )}
        {activeTab === "monetization" && !isGuest && (
          <div style={{ maxWidth: 480 }}>
            <h3 style={{ fontFamily: "Orbitron, monospace", fontSize: 16, color: "var(--teal)", marginBottom: 8 }}>{d.monet.title}</h3>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>{d.monet.sub}</p>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: 12, color: "#f59e0b", marginBottom: 24, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 6, padding: "8px 14px" }}>⚠ {d.monet.note}</p>
            {monetStatus === null && (
              <>
                <input className="form-input" placeholder={d.monet.cardNum} value={monetCard.num} onChange={e => setMonetCard(c => ({ ...c, num: e.target.value }))} style={{ marginBottom: 10 }} />
                <input className="form-input" placeholder={d.monet.expiry} value={monetCard.expiry} onChange={e => setMonetCard(c => ({ ...c, expiry: e.target.value }))} style={{ marginBottom: 20, maxWidth: 140 }} />
                <button className="btn-primary" onClick={() => setMonetStatus("pending")} disabled={!monetCard.num}>
                  {d.monet.submit}
                </button>
              </>
            )}
            {monetStatus === "pending" && (
              <div style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 8, padding: 20, color: "#fbbf24", fontFamily: "Exo 2, sans-serif", fontSize: 13 }}>
                ⏳ {d.monet.pending}
              </div>
            )}
            {monetStatus === "approved" && (
              <div style={{ background: "rgba(0,255,0,0.08)", border: "1px solid rgba(0,255,0,0.25)", borderRadius: 8, padding: 20, color: "var(--teal)", fontFamily: "Exo 2, sans-serif", fontSize: 13 }}>
                {d.monet.approved}
              </div>
            )}
            {monetStatus === "rejected" && (
              <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.25)", borderRadius: 8, padding: 20, color: "#ff4444", fontFamily: "Exo 2, sans-serif", fontSize: 13 }}>
                {d.monet.rejected}
              </div>
            )}
          </div>
        )}

        {activeTab === "promo" && (
          <div style={{ maxWidth: 420 }}>
            <input className="form-input" placeholder={d.promoPh} value={promoCode} onChange={(e) => setPromoCode(e.target.value)} style={{ marginBottom: 12 }} />
            <button type="button" className="btn-primary" onClick={activatePromo}>{d.promoBtn}</button>
            {promoMsg && <p style={{ marginTop: 12, color: "var(--teal)", fontFamily: "Exo 2, sans-serif", fontSize: 13 }}>{promoMsg}</p>}
          </div>
        )}

        {activeTab === "audit" && isAdmin && (
          <div style={{ maxWidth: 720 }}>
            {auditLogs.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>—</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {auditLogs.map((log) => (
                  <li key={log._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 12, fontSize: 12, fontFamily: "Exo 2, sans-serif" }}>
                    <strong style={{ color: "var(--teal)" }}>{log.action}</strong> — {log.actor?.name || "system"} · {new Date(log.createdAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: 440 }}>
            <input className="form-input" placeholder={t.contact.name} style={{ marginBottom: 12 }} />
            <input className="form-input" type="email" placeholder="Email" style={{ marginBottom: 12 }} />
            <input className="form-input" placeholder="Telegram" style={{ marginBottom: 12 }} />
            <input className="form-input" placeholder="Instagram" style={{ marginBottom: 20 }} />
            <button className="btn-primary">{t.lang === "RU" ? "Сохранить" : t.lang === "UZ" ? "Saqlash" : "Save"}</button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Scripts Page (with paid price + commission hint) ─────────
function ScriptsPage({ t, scriptFilter, setScriptFilter, searchVal, setSearchVal, setUploadModal, lang, isGuest }) {
  const d = t.scripts;
  const filtered = d.items.filter((s) => {
    const matchFilter = scriptFilter === 0 || s.genre === d.filters[scriptFilter];
    const matchSearch = s.title.toLowerCase().includes(searchVal.toLowerCase()) || s.author.toLowerCase().includes(searchVal.toLowerCase());
    return matchFilter && matchSearch;
  });
  return (
    <section className="scripts-page" aria-labelledby="scripts-title">
      <div className="section-inner">
        <div className="section-label">Library</div>
        <div className="teal-divider" />
        <h2 id="scripts-title" className="section-title">{d.title}</h2>
        <p className="section-sub">{d.sub}</p>
        <div className="scripts-toolbar" role="toolbar" aria-label="Script filters">
          <input className="search-input" placeholder={d.search} value={searchVal} onChange={(e) => setSearchVal(e.target.value)} aria-label={d.search} />
          {d.filters.map((f, i) => (
            <button key={i} className={`filter-btn${scriptFilter === i ? " active" : ""}`} onClick={() => setScriptFilter(i)} aria-pressed={scriptFilter === i}>{f}</button>
          ))}
          {!isGuest && <button type="button" className="upload-btn" onClick={() => setUploadModal(true)} aria-label={d.upload}>+ {d.upload}</button>}
        </div>
        <div className="scripts-grid" role="list">
          {filtered.map((s, i) => (
            <article className="script-card fade-in" key={i} style={{ animationDelay: `${i * 0.08}s` }} role="listitem">
              <div className="script-header">
                <div className="script-title">{s.title}</div>
                <div className="script-price">{s.price}</div>
              </div>
              <div className="script-genre">{s.genre}</div>
              <div className="script-meta">
                <span>{s.author}</span>
                <span>{s.pages}p.</span>
                <span>💬 {s.comments}</span>
              </div>
              <div className="script-actions">
                <button className="btn-sm btn-sm-teal">{lang === "RU" ? "Читать" : lang === "UZ" ? "O'qish" : "Read"}</button>
                <button className="btn-sm btn-sm-outline">{lang === "RU" ? "Скачать" : lang === "UZ" ? "Yuklab olish" : "Download"}</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Other page components (unchanged logic, theme-aware) ─────
function AboutPage({ t }) {
  const d = t.about;
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="section-inner">
        <div className="section-label">Studio</div>
        <div className="teal-divider" />
        <div className="about-grid">
          <div className="about-text">
            <h2 id="about-title" className="section-title">{d.title}</h2>
            <p className="section-sub">{d.sub}</p>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: 14, lineHeight: 1.8, color: "var(--text-muted)", marginBottom: 12 }}>{d.p1}</p>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: 14, lineHeight: 1.8, color: "var(--text-muted)" }}>{d.p2}</p>
            <div className="about-stats" role="list">
              {d.stats.map((s, i) => (
                <div className="stat-card fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }} role="listitem">
                  <div className="stat-n">{s.n}</div><div className="stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-visual" aria-hidden="true">
            <div className="about-card">
              <div className="ee-monogram">EE</div>
              <div className="about-card-title">Emerald Empire</div>
              <div className="about-card-sub">Premium Screenwriting Studio · 2020</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PortfolioPage({ t, preview }) {
  const d = t.portfolio;
  const items = preview ? d.items.slice(0, 3) : d.items;
  return (
    <section className="portfolio" id="portfolio" aria-labelledby="portfolio-title">
      <div className="section-inner">
        <div className="section-label">Works</div>
        <div className="teal-divider" />
        <h2 id="portfolio-title" className="section-title">{d.title}</h2>
        <p className="section-sub">{d.sub}</p>
        <div className="portfolio-grid" role="list">
          {items.map((item, i) => (
            <article className="port-card fade-in" key={i} style={{ animationDelay: `${i * 0.08}s` }} role="listitem" tabIndex={0}>
              <div className="port-genre">{item.genre}</div>
              <div className="port-title">{item.title}</div>
              <div className="port-meta"><span>{item.author}</span><span>{item.year}</span></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection({ t }) {
  const d = t.reviews;
  const [idx, setIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setIdx(i => (i + 1) % d.items.length), 5000); return () => clearInterval(id); }, [d.items.length]);
  const item = d.items[idx];
  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="section-inner">
        <div className="section-label">Testimonials</div>
        <div className="teal-divider" />
        <h2 id="reviews-title" className="section-title">{d.title}</h2>
        <p className="section-sub">{d.sub}</p>
        <div className="review-slider">
          <div className="review-card">
            <div className="review-stars">★★★★★</div>
            <p className="review-text">"{item.text}"</p>
            <div className="review-name">{item.name}</div>
            <div className="review-role">{item.role}</div>
          </div>
          <div className="review-dots">
            {d.items.map((_, i) => <button key={i} className={`dot${i === idx ? " active" : ""}`} onClick={() => setIdx(i)} aria-label={`Review ${i + 1}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogPage({ t, preview }) {
  const d = t.blog;
  const items = preview ? d.items.slice(0, 3) : d.items;
  const nums = ["01", "02", "03"];
  return (
    <section className="blog" id="blog" aria-labelledby="blog-title">
      <div className="section-inner">
        <div className="section-label">Insights</div>
        <div className="teal-divider" />
        <h2 id="blog-title" className="section-title">{d.title}</h2>
        <p className="section-sub">{d.sub}</p>
        <div className="blog-grid" role="list">
          {items.map((item, i) => (
            <article className="blog-card fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }} role="listitem" tabIndex={0}>
              <div className="blog-img" aria-hidden="true">{nums[i]}</div>
              <div className="blog-body">
                <div className="blog-tag">{item.tag}</div>
                <div className="blog-title">{item.title}</div>
                <div className="blog-meta"><span><time>{item.date}</time></span><span>{item.min}</span></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactPage({ t, formSent, setFormSent }) {
  const d = t.contact;
  return (
    <section className="contact" style={{ paddingTop: 100 }} aria-labelledby="contact-title">
      <div className="section-inner">
        <div className="section-label">Contact</div>
        <div className="teal-divider" />
        <h2 id="contact-title" className="section-title">{d.title}</h2>
        <p className="section-sub">{d.sub}</p>
        <div className="contact-grid">
          <div>
            {formSent ? (
              <div className="success-msg" role="status">✓ {d.send}!</div>
            ) : (
              <div className="contact-form">
                <input className="form-input" placeholder={d.name} aria-label={d.name} />
                <input className="form-input" type="email" placeholder={d.email} aria-label={d.email} />
                <textarea className="form-input" placeholder={d.message} aria-label={d.message} />
                <button className="btn-primary" onClick={() => setFormSent(true)}>{d.send}</button>
              </div>
            )}
          </div>
          <div className="contact-info">
            <h3>Emerald Empire Studio</h3>
            <address style={{ fontStyle: "normal" }}>
              <p>Tashkent, Uzbekistan<br /><a href="mailto:emerald@empire.studio" style={{ color: "inherit" }}>emerald@empire.studio</a></p>
            </address>
            <p>{d.or}</p>
            <div className="socials">
              <a className="social-btn" href="https://t.me/emeraldempire" aria-label="Telegram"><TelegramIcon /> Telegram</a>
              <a className="social-btn" href="https://instagram.com/emeraldempire" aria-label="Instagram"><InstagramIcon /> Instagram</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage({ t, setPage, setAuthOpen, theme }) {
  return (
    <>
      <section className="hero" aria-label="Hero section">
        <ParticleCanvas accent={THEMES[theme]?.vars["--teal"]} />
        <div style={{ position: "relative", zIndex: 1, padding: "80px 16px 0" }}>
          <div className="hero-tag">{t.hero.tag}</div>
          <h1 className="hero-title">
            {t.hero.title.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "hero-title-em" : ""}>{line}</span>
            ))}
          </h1>
          <p className="hero-sub">{t.hero.subtitle}</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => setPage("scripts")}>{t.hero.cta}</button>
            <button className="btn-outline" onClick={() => setPage("portfolio")}>{t.hero.cta2}</button>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true"><div className="hero-scroll-line" /></div>
      </section>
      <AboutPage t={t} />
      <PortfolioPage t={t} preview />
      <ReviewsSection t={t} />
      <BlogPage t={t} preview />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── UPLOAD MODAL — paid price + commission ──────────────────────
// ═══════════════════════════════════════════════════════════════
function UploadModal({ t, lang, onClose, monetCardLinked }) {
  const d = t.scripts;
  const [pricing, setPricing] = useState("free");
  const [priceUSD, setPriceUSD] = useState("");

  const commission = priceUSD && Number(priceUSD) > 8
    ? `Commission: $${(Number(priceUSD) * 0.05).toFixed(2)} (5%)`
    : priceUSD && Number(priceUSD) > 0 ? "No commission" : "";

  const canPublishPaid = pricing === "free" || monetCardLinked;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={d.upload} onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-title orbitron">{d.upload}</div>
        <input className="form-input" placeholder={lang === "RU" ? "Название" : lang === "UZ" ? "Nomi" : "Title"} style={{ marginBottom: 12 }} />
        <input className="form-input" placeholder={lang === "RU" ? "Жанр" : lang === "UZ" ? "Janr" : "Genre"} style={{ marginBottom: 12 }} />
        <div className="upload-zone" role="button" tabIndex={0}>
          <div className="upload-icon">📄</div>
          <p>{lang === "RU" ? "Перетащите PDF / TXT сюда" : "Drop PDF / TXT here"}</p>
        </div>
        <select className="form-input" style={{ marginTop: 14, marginBottom: 12 }} value={pricing} onChange={e => setPricing(e.target.value)} aria-label="Pricing">
          <option value="free">{d.freeLabel}</option>
          <option value="paid">{d.paidLabel}</option>
        </select>
        {pricing === "paid" && (
          <>
            <input className="form-input" type="number" min={0} step={0.01} placeholder="Price (USD)" value={priceUSD} onChange={e => setPriceUSD(e.target.value)} style={{ marginBottom: 8 }} aria-label="Price in USD" />
            {commission && <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, fontFamily: "Exo 2, sans-serif" }}>ℹ {commission}</p>}
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, fontFamily: "Exo 2, sans-serif" }}>{d.priceHint}</p>
            {!monetCardLinked && <p style={{ fontSize: 12, color: "#f59e0b", marginBottom: 12, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "8px 12px", fontFamily: "Exo 2, sans-serif" }}>⚠ {d.needCard}</p>}
          </>
        )}
        <button className="btn-primary" style={{ width: "100%", marginTop: 12 }} disabled={!canPublishPaid}>
          {lang === "RU" ? "Опубликовать" : lang === "UZ" ? "E'lon qilish" : "Publish"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ── ROOT APP ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
export default function EmeraldEmpire() {
  const [lang, setLang] = useState(() => ensureGuestProfile().lang || "RU");
  const [theme, setTheme] = useState(() => ensureGuestProfile().theme || "dark");
  const [user, setUser] = useState(() => ensureGuestProfile());
  const [page, setPage] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [uploadModal, setUploadModal] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [scriptFilter, setScriptFilter] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const isGuest = !getAuthToken();
  const isAdmin = isAdminMode();
  const monetCardLinked = false;

  const t = i18n[lang];
  const th = THEMES[theme] || THEMES.dark;
  const themeVars = [
    ...Object.entries(th.vars || {}).map(([k, v]) => `${k}:${v}`),
    `--logo-filter:${th.logoFilter || "none"}`,
  ].join(";");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    if (isGuest) {
      const g = { ...ensureGuestProfile(), theme, lang };
      saveGuestProfile(g);
      setUser(g);
    }
  }, [theme, lang, isGuest]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Apply theme transition smoothly via body class
  useEffect(() => {
    document.body.style.transition = "background 0.4s, color 0.4s";
    document.body.style.background = THEMES[theme]?.vars["--bg"] || "#000";
  }, [theme]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { ${themeVars} }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--silver); font-family: 'Exo 2', sans-serif; min-height: 100vh; transition: background 0.4s, color 0.4s; }
    .section-inner { max-width: 1200px; margin: 0 auto; padding: 0 clamp(16px,4vw,64px); }
    .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--teal); margin-bottom: 12px; }
    .section-title { font-family: 'Orbitron', monospace; font-size: clamp(24px,4vw,40px); font-weight: 700; color: var(--silver); line-height: 1.15; margin-bottom: 16px; }
    .section-sub { font-size: 15px; color: var(--text-muted); line-height: 1.7; margin-bottom: 48px; max-width: 560px; }

    /* NAV */
    .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 20px clamp(16px,4vw,64px); display: flex; align-items: center; gap: 24px; transition: all 0.4s; }
    .nav.scrolled { background: rgba(0,0,0,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 14px clamp(16px,4vw,64px); }
    .nav-logo { font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 900; color: var(--teal); cursor: pointer; user-select: none; letter-spacing: 0.06em; flex-shrink: 0; }
    .nav-logo span { color: var(--silver); }
    .nav-links { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; justify-content: center; }
    .nav-link { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); cursor: pointer; padding: 6px 10px; border-radius: 4px; transition: all 0.2s; user-select: none; }
    .nav-link:hover, .nav-link.active { color: var(--teal); background: var(--hover); }
    .nav.scrolled { background: color-mix(in srgb, var(--bg) 92%, transparent); }
    .mobile-menu { background: color-mix(in srgb, var(--bg) 97%, transparent); }
    .nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }
    .btn-login { font-family: 'Exo 2', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 9px 18px; border-radius: 6px; cursor: pointer; border: 1px solid var(--teal); background: var(--teal); color: #000; transition: all 0.2s; }
    .btn-login:hover { opacity: 0.85; }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; }
    .hamburger span { display: block; width: 22px; height: 2px; background: var(--silver); border-radius: 1px; transition: all 0.2s; }
    @media(max-width: 900px) { .nav-links { display: none; } .hamburger { display: flex; } }
    .mobile-menu { position: fixed; top: 70px; left: 0; right: 0; background: rgba(0,0,0,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 24px clamp(16px,4vw,64px); display: flex; flex-direction: column; gap: 8px; z-index: 99; }

    /* HERO */
    .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; position: relative; overflow: hidden; padding: 0 16px; }
    .hero-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--teal); border: 1px solid var(--teal); border-radius: 20px; padding: 6px 18px; display: inline-block; margin-bottom: 32px; opacity: 0.9; }
    .hero-title { font-family: 'Orbitron', monospace; font-size: clamp(52px,9vw,110px); font-weight: 900; line-height: 1.02; display: flex; flex-direction: column; gap: 4px; margin-bottom: 28px; color: var(--silver); }
    .hero-title-em { color: var(--teal); text-shadow: 0 0 40px var(--teal), 0 0 80px rgba(0,255,0,0.2); }
    .hero-sub { font-size: 16px; color: var(--text-muted); max-width: 540px; line-height: 1.75; margin-bottom: 48px; }
    .hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn-primary { font-family: 'Exo 2', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 32px; border-radius: 6px; cursor: pointer; background: var(--teal); color: #000; border: none; transition: all 0.2s; }
    .btn-primary:hover { opacity: 0.85; transform: translateY(-2px); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    .btn-outline { font-family: 'Exo 2', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 13px 32px; border-radius: 6px; cursor: pointer; background: transparent; color: var(--teal); border: 1.5px solid var(--teal); transition: all 0.2s; }
    .btn-outline:hover { background: rgba(0,255,0,0.08); transform: translateY(-2px); }
    .hero-scroll { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; animation: bounce 2s infinite; }
    .hero-scroll-line { width: 1px; height: 48px; background: linear-gradient(180deg,var(--teal),transparent); }

    /* ABOUT */
    .about { padding: 120px 0; background: var(--bg2); }
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .about-text p { font-size: 14px; color: var(--text-muted); line-height: 1.8; margin-bottom: 12px; }
    .about-stats { display: flex; gap: 20px; flex-wrap: wrap; margin-top: 36px; }
    .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px 20px; text-align: center; min-width: 90px; }
    .stat-n { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 700; color: var(--teal); }
    .stat-l { font-size: 11px; color: var(--text-muted); margin-top: 4px; letter-spacing: 0.08em; text-transform: uppercase; }
    .about-visual { display: flex; justify-content: center; }
    .about-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 48px; text-align: center; }
    .ee-monogram { font-family: 'Orbitron', monospace; font-size: 64px; font-weight: 900; color: var(--teal); margin-bottom: 20px; }
    .about-card-title { font-family: 'Orbitron', monospace; font-size: 20px; color: var(--silver); margin-bottom: 8px; }
    .about-card-sub { font-size: 12px; color: var(--text-muted); letter-spacing: 0.1em; }
    @media(max-width: 768px) { .about-grid { grid-template-columns: 1fr; gap: 40px; } }

    /* PORTFOLIO */
    .portfolio { padding: 120px 0; background: var(--bg); }
    .portfolio-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
    .port-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 28px; cursor: pointer; transition: all 0.3s; }
    .port-card:hover { border-color: var(--teal); transform: translateY(-4px); box-shadow: 0 0 20px rgba(0,255,0,0.1); }
    .port-genre { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--teal); margin-bottom: 12px; }
    .port-title { font-family: 'Orbitron', monospace; font-size: 15px; font-weight: 600; color: var(--silver); margin-bottom: 16px; line-height: 1.3; }
    .port-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); }
    @media(max-width: 900px) { .portfolio-grid { grid-template-columns: repeat(2,1fr); } }
    @media(max-width: 560px) { .portfolio-grid { grid-template-columns: 1fr; } }

    /* SCRIPTS */
    .scripts-page { padding: 100px 0 80px; }
    .scripts-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px; align-items: center; }
    .search-input { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 10px 16px; color: var(--silver); font-family: 'Exo 2', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; min-width: 220px; }
    .search-input:focus { border-color: var(--teal); }
    .search-input::placeholder { color: var(--text-muted); }
    .filter-btn { background: none; border: 1px solid var(--border); color: var(--text-muted); font-family: 'Exo 2', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; padding: 8px 16px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
    .filter-btn.active, .filter-btn:hover { background: var(--teal); border-color: var(--teal); color: #000; }
    .upload-btn { background: var(--card); border: 1px solid var(--border); color: var(--silver); font-family: 'Exo 2', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; padding: 9px 20px; border-radius: 4px; cursor: pointer; transition: all 0.2s; margin-left: auto; }
    .upload-btn:hover { background: var(--teal); color: #000; border-color: var(--teal); }
    .scripts-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 20px; }
    .script-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 24px; transition: all 0.3s; }
    .script-card:hover { border-color: var(--teal); transform: translateY(-3px); }
    .script-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 12px; }
    .script-title { font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 600; color: var(--silver); line-height: 1.3; }
    .script-price { font-size: 11px; font-weight: 700; color: var(--teal); white-space: nowrap; }
    .script-genre { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--teal); margin-bottom: 14px; opacity: 0.8; }
    .script-meta { display: flex; gap: 12px; font-size: 11px; color: var(--text-muted); margin-bottom: 18px; flex-wrap: wrap; }
    .script-actions { display: flex; gap: 8px; }
    .btn-sm { font-family: 'Exo 2', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 7px 14px; border-radius: 3px; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-sm-teal { background: var(--teal); color: #000; }
    .btn-sm-teal:hover { opacity: 0.85; }
    .btn-sm-outline { background: transparent; border: 1px solid var(--border) !important; color: var(--silver); }
    .btn-sm-outline:hover { border-color: var(--teal) !important; color: var(--teal); }

    /* REVIEWS */
    .reviews { padding: 100px 0; background: var(--bg2); }
    .review-slider { max-width: 680px; margin: 0 auto; }
    .review-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 40px; }
    .review-stars { color: var(--teal); font-size: 18px; letter-spacing: 4px; margin-bottom: 20px; }
    .review-text { font-size: 16px; color: var(--text-muted); line-height: 1.75; font-style: italic; margin-bottom: 24px; }
    .review-name { font-family: 'Orbitron', monospace; font-size: 14px; color: var(--silver); margin-bottom: 4px; }
    .review-role { font-size: 12px; color: var(--text-muted); letter-spacing: 0.1em; }
    .review-dots { display: flex; justify-content: center; gap: 10px; margin-top: 28px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); cursor: pointer; transition: all 0.2s; border: none; }
    .dot.active { background: var(--teal); transform: scale(1.3); }

    /* BLOG */
    .blog { padding: 100px 0; }
    .blog-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
    .blog-card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s; }
    .blog-card:hover { border-color: var(--teal); transform: translateY(-4px); }
    .blog-img { height: 140px; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-size: 32px; font-weight: 900; color: var(--teal); opacity: 0.2; }
    .blog-body { padding: 20px; }
    .blog-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--teal); margin-bottom: 10px; }
    .blog-title { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 600; color: var(--silver); line-height: 1.4; margin-bottom: 12px; }
    .blog-meta { font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; }
    @media(max-width: 900px) { .blog-grid { grid-template-columns: repeat(2,1fr); } }
    @media(max-width: 560px) { .blog-grid { grid-template-columns: 1fr; } }

    /* CONTACT */
    .contact { padding: 100px 0; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; }
    .contact-form { display: flex; flex-direction: column; gap: 16px; }
    .form-input { background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 13px 16px; color: var(--silver); font-family: 'Exo 2', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; width: 100%; }
    .form-input:focus { border-color: var(--teal); }
    .form-input::placeholder { color: var(--text-muted); }
    textarea.form-input { resize: vertical; min-height: 120px; }
    .socials { display: flex; gap: 14px; margin-top: 16px; }
    .social-btn { display: flex; align-items: center; gap: 8px; background: var(--card); border: 1px solid var(--border); color: var(--silver); padding: 10px 18px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: all 0.2s; text-decoration: none; font-family: 'Exo 2', sans-serif; }
    .social-btn:hover { border-color: var(--teal); color: var(--teal); }
    .contact-info h3 { font-family: 'Orbitron', monospace; font-size: 20px; color: var(--silver); margin-bottom: 20px; }
    .contact-info p { font-size: 14px; color: var(--text-muted); line-height: 1.7; margin-bottom: 20px; }
    .success-msg { background: rgba(0,255,0,0.08); border: 1px solid rgba(0,255,0,0.25); border-radius: 6px; padding: 16px; color: var(--teal); font-size: 14px; text-align: center; }
    @media(max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }

    /* MODAL */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 40px; width: 100%; max-width: 400px; position: relative; }
    .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); font-size: 22px; cursor: pointer; }
    .modal-close:hover { color: var(--silver); }
    .modal-title { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; color: var(--silver); margin-bottom: 28px; }
    .modal-hint { font-size: 12px; color: var(--text-muted); margin-top: 20px; text-align: center; cursor: pointer; }
    .modal-hint:hover { color: var(--teal); }
    .upload-zone { border: 2px dashed var(--border); border-radius: 8px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; margin-top: 12px; }
    .upload-zone:hover { border-color: var(--teal); }
    .upload-icon { font-size: 32px; margin-bottom: 12px; }
    .upload-zone p { font-size: 13px; color: var(--text-muted); }

    /* FOOTER */
    .footer { background: var(--bg2); border-top: 1px solid var(--border); padding: 48px 0 28px; }
    .footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 clamp(16px,4vw,64px); }
    .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }
    .footer-logo { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 700; color: var(--teal); margin-bottom: 12px; }
    .footer-desc { font-size: 13px; color: var(--text-muted); line-height: 1.7; }
    .footer-col h4 { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--silver); margin-bottom: 16px; }
    .footer-link { display: block; font-size: 13px; color: var(--text-muted); cursor: pointer; margin-bottom: 8px; transition: color 0.2s; text-decoration: none; }
    .footer-link:hover { color: var(--teal); }
    .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
    .footer-copy { font-size: 12px; color: var(--text-muted); }
    @media(max-width: 768px) { .footer-top { grid-template-columns: 1fr; gap: 28px; } }

    /* ANIMATIONS */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
    @keyframes themeFade { from { opacity: 0.7; } to { opacity: 1; } }
    .fade-in { animation: fadeUp 0.6s both; }
    .teal-divider { width: 48px; height: 3px; background: linear-gradient(90deg, var(--teal), var(--purple)); border-radius: 2px; margin: 0 0 32px; }
    *:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }
    .orbitron { font-family: 'Orbitron', monospace; }
  `;

  const nav = t.nav;
  const navLinks = [
    { id: "home", label: nav.home },
    { id: "about", label: nav.about },
    { id: "portfolio", label: nav.portfolio },
    { id: "scripts", label: nav.scripts },
    { id: "blog", label: nav.blog },
    { id: "tournaments", label: nav.tournaments },
    { id: "games", label: nav.games },
    { id: "forum", label: nav.forum },
    { id: "contact", label: nav.contact },
  ];

  return (
    <>
      <style>{css}</style>

      {/* Skip link */}
      <a href="#main-content" style={{ position: "absolute", left: -9999, top: 0, background: "var(--teal)", color: "#000", padding: "8px 16px", borderRadius: 4, zIndex: 9999 }}
        onFocus={(e) => e.target.style.left = "16px"} onBlur={(e) => e.target.style.left = "-9999px"}>
        Skip to content
      </a>

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`} role="navigation" aria-label="Main navigation">
        <div className="nav-logo" onClick={() => setPage("home")} role="button" tabIndex={0} aria-label="Emerald Empire — Home" onKeyDown={(e) => e.key === "Enter" && setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <EmeraldLogo themeId={theme} size={34} />
          <span>EMERALD<span> EMPIRE</span></span>
        </div>
        <div className="nav-links" role="menubar">
          {navLinks.map((l) => (
            <span key={l.id} role="menuitem" tabIndex={0} className={`nav-link${page === l.id ? " active" : ""}`}
              onClick={() => setPage(l.id)} onKeyDown={(e) => e.key === "Enter" && setPage(l.id)}
              aria-current={page === l.id ? "page" : undefined}>
              {l.label}
            </span>
          ))}
        </div>
        <div className="nav-right">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <LangSwitcher lang={lang} setLang={setLang} />
          <button className="btn-login" onClick={() => setAuthOpen(true)} aria-label={nav.login}>{nav.login}</button>
          <button type="button" className="btn-login" style={{ background: "var(--card)", color: "var(--teal)" }} onClick={() => setPage("dashboard")} aria-label={nav.dashboard}>⚙</button>
          <div className="hamburger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu" aria-expanded={mobileMenu} role="button" tabIndex={0}>
            <span /><span /><span />
          </div>
        </div>
      </nav>

      {mobileMenu && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {navLinks.map((l) => (
            <span key={l.id} className={`nav-link${page === l.id ? " active" : ""}`}
              onClick={() => { setPage(l.id); setMobileMenu(false); }} role="menuitem" tabIndex={0}>
              {l.label}
            </span>
          ))}
          <span className={`nav-link${page === "dashboard" ? " active" : ""}`}
            onClick={() => { setPage("dashboard"); setMobileMenu(false); }} role="menuitem" tabIndex={0}>
            {nav.dashboard}
          </span>
          <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <LangSwitcher lang={lang} setLang={setLang} />
          </div>
        </nav>
      )}

      {/* MAIN */}
      <main id="main-content">
        {page === "home" && <HomePage t={t} setPage={setPage} setAuthOpen={setAuthOpen} theme={theme} />}
        {page === "about" && <AboutPage t={t} />}
        {page === "portfolio" && <PortfolioPage t={t} />}
        {page === "scripts" && <ScriptsPage t={t} scriptFilter={scriptFilter} setScriptFilter={setScriptFilter} searchVal={searchVal} setSearchVal={setSearchVal} setUploadModal={setUploadModal} lang={lang} isGuest={isGuest} />}
        {page === "blog" && <BlogPage t={t} />}
        {page === "contact" && <ContactPage t={t} formSent={formSent} setFormSent={setFormSent} />}
        {page === "tournaments" && <TournamentsPage t={t} lang={lang} />}
        {page === "games" && <GamesHub t={t} theme={theme} />}
        {page === "forum" && <ForumPage t={t} isGuest={isGuest} />}
        {page === "dashboard" && <DashboardPage t={t} theme={theme} setTheme={setTheme} user={user} isGuest={isGuest} isAdmin={isAdmin} />}
      </main>

      {/* FOOTER */}
      <footer className="footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">EMERALD EMPIRE</div>
              <p className="footer-desc">Премиальная студия для сценаристов и создателей контента. RU | UZ | EN</p>
            </div>
            <div>
              <h4 className="footer-col">{nav.home}</h4>
              {navLinks.map((l) => <span key={l.id} className="footer-link" onClick={() => setPage(l.id)} role="link" tabIndex={0}>{l.label}</span>)}
            </div>
            <div>
              <h4>Social</h4>
              <a className="footer-link" href="https://t.me/emeraldempire" aria-label="Telegram">Telegram</a>
              <a className="footer-link" href="https://instagram.com/emeraldempire" aria-label="Instagram">Instagram</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">{t.footer.copy}</span>
            <LangSwitcher lang={lang} setLang={setLang} />
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {authOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={t.auth.title} onClick={() => setAuthOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setAuthOpen(false); setAuthStep(1); }} aria-label="Close">✕</button>
            <div className="modal-title orbitron">{authStep === 1 ? t.auth.title : t.auth.step2}</div>
            {authStep === 1 ? (
              <>
                <input className="form-input" placeholder={t.auth.email} type="email" style={{ marginBottom: 12 }} aria-label={t.auth.email} />
                <input className="form-input" placeholder={t.auth.pass} type="password" style={{ marginBottom: 20 }} aria-label={t.auth.pass} />
                <button className="btn-primary" style={{ width: "100%" }} onClick={() => setAuthStep(2)}>{t.auth.btn}</button>
                <p className="modal-hint" role="button" tabIndex={0}>{t.auth.noAcc}</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                  {lang === "UZ" ? "Kod elektron pochtaga yuborildi" : lang === "EN" ? "Code sent to your email" : "Код отправлен на почту"}
                </p>
                <input className="form-input" placeholder={t.auth.code} style={{ marginBottom: 20, letterSpacing: "0.3em", textAlign: "center", fontSize: 20 }} maxLength={6} />
                <button className="btn-primary" style={{ width: "100%" }} onClick={() => { setAuthOpen(false); setAuthStep(1); }}>{t.auth.btn}</button>
                <p className="modal-hint" onClick={() => setAuthStep(1)} role="button" tabIndex={0}>{t.auth.resend}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {uploadModal && !isGuest && <UploadModal t={t} lang={lang} onClose={() => setUploadModal(false)} monetCardLinked={monetCardLinked} />}
    </>
  );
}

