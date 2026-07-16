const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
}

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const MINI_APP_URL = "https://project-e3jce.vercel.app";
const WHATSAPP_URL = "https://wa.me/84937762607";
const BOT_USERNAME = "govietstay_travel_bot";

const CONTEXT_TTL = 6 * 60 * 60 * 1000;
const DEFAULT_LANGUAGE = "ru";

const conversations =
  globalThis.__DAO_BRAIN_V7_CONVERSATIONS__ || new Map();

globalThis.__DAO_BRAIN_V7_CONVERSATIONS__ = conversations;

/* =========================================================
   PRICE BOOK — GOVIETSTAY
   Update prices here when needed.
========================================================= */

const PRICE_BOOK = {
  bana: {
    type: "from",
    publicPrice: 1550000,
    currency: "VND",
    unit: "person",
    notes: {
      vi: "Giá tour từ 1.550.000 VND/người. Vé cáp treo lẻ: người lớn 930.000 VND; trẻ em/người cao tuổi 750.000 VND. Gói cáp treo + buffet: người lớn 1.150.000 VND.",
      en: "Tour price starts from 1,550,000 VND per person. Cable-car ticket only: adult 930,000 VND; child/senior 750,000 VND. Cable car + buffet: adult 1,150,000 VND.",
      ru: "Стоимость тура — от 1 550 000 VND с человека. Только канатная дорога: взрослый 930 000 VND; ребёнок/пожилой гость 750 000 VND. Канатная дорога + шведский стол: взрослый 1 150 000 VND.",
    },
  },

  cham: {
    type: "tiered",
    currency: "VND",
    sharedAdult: 950000,
    sharedChild: 750000,
    privateAdult: 1350000,
    privateChild: 1050000,
    notes: {
      vi: "Tour ghép: người lớn 950.000 VND, trẻ em 750.000 VND. Tour riêng: người lớn 1.350.000 VND, trẻ em 1.050.000 VND. Chuyến đi phụ thuộc tình trạng biển và quyết định của cảng.",
      en: "Shared tour: adult 950,000 VND, child 750,000 VND. Private tour: adult 1,350,000 VND, child 1,050,000 VND. The trip depends on sea conditions and port approval.",
      ru: "Групповой тур: взрослый 950 000 VND, ребёнок 750 000 VND. Частный тур: взрослый 1 350 000 VND, ребёнок 1 050 000 VND. Поездка зависит от состояния моря и разрешения порта.",
    },
  },

  hoian: {
    type: "from",
    publicPrice: 1250000,
    currency: "VND",
    unit: "person",
    notes: {
      vi: "Combo Rừng dừa thuyền thúng + Phố cổ Hội An từ 1.250.000 VND/người.",
      en: "Coconut Forest basket boat + Hoi An Ancient Town starts from 1,250,000 VND per person.",
      ru: "Кокосовый лес с лодкой-корзиной + Старый город Хойана — от 1 250 000 VND с человека.",
    },
  },

  airport: {
    type: "from",
    publicPrice: 350000,
    currency: "VND",
    unit: "car",
    notes: {
      vi: "Đón sân bay Đà Nẵng từ 350.000 VND/xe. Giá cuối cùng phụ thuộc điểm đến, giờ đón và loại xe.",
      en: "Da Nang airport transfer starts from 350,000 VND per car. Final price depends on destination, pickup time, and vehicle type.",
      ru: "Трансфер из аэропорта Дананга — от 350 000 VND за машину. Итоговая цена зависит от места назначения, времени встречи и типа автомобиля.",
    },
  },

  visa: {
    type: "from",
    publicPriceUSD: 37,
    currency: "USD",
    unit: "application",
    notes: {
      vi: "eVisa 3 tháng một lần nhập cảnh từ 37 USD; nhiều lần nhập cảnh từ 62 USD. Thời gian tiêu chuẩn khoảng 4–5 ngày làm việc. Hồ sơ khẩn tính thêm phí.",
      en: "Three-month single-entry eVisa starts from USD 37; multiple-entry starts from USD 62. Standard processing is about 4–5 working days. Express processing costs extra.",
      ru: "Электронная виза на 3 месяца с однократным въездом — от 37 USD; с многократным въездом — от 62 USD. Стандартное оформление занимает около 4–5 рабочих дней. Срочное оформление оплачивается отдельно.",
    },
  },
};


/* =========================================================
   COMBO DATABASE — GOVIETSTAY
========================================================= */

const COMBO_BOOK = {
  combo1: {
    id: "combo1",
    code: "COMBO 1",
    duration: { days: 2, nights: 1 },
    pricePerPerson: 2660000,
    individualTotal: 2800000,
    savingPerPerson: 140000,
    discountPercent: 5,
    tours: ["bana", "hoian"],
    aliases: [
      "combo 1", "classic da nang", "combo ba na hoi an",
      "combo bà nà hội an", "классический дананг",
      "бана хойан", "combo bana hoian"
    ],
    names: {
      vi: "Combo 1 – Classic Đà Nẵng",
      en: "Combo 1 – Classic Da Nang",
      ru: "Комбо 1 – Классический Дананг"
    },
    summary: {
      vi: "2 ngày 1 đêm: Bà Nà Hills & Cầu Vàng; Rừng dừa thuyền thúng + Phố cổ Hội An.",
      en: "2 days / 1 night: Ba Na Hills & Golden Bridge; Coconut Forest basket boat + Hoi An Ancient Town.",
      ru: "2 дня / 1 ночь: Бана Хиллс и Золотой мост; кокосовый лес, лодки-корзины и Старый город Хойана."
    },
    bestFor: {
      vi: ["Khách lần đầu", "Gia đình", "Cặp đôi", "Nhóm bạn", "Lưu trú 3–4 ngày"],
      en: ["First-time visitors", "Families", "Couples", "Friends & groups", "3–4 day stays"],
      ru: ["Первый визит", "Семьи", "Пары", "Друзья и группы", "Проживание 3–4 дня"]
    }
  },

  combo2: {
    id: "combo2",
    code: "COMBO 2",
    duration: { days: 2, nights: 1 },
    pricePerPerson: 2090000,
    individualTotal: 2200000,
    savingPerPerson: 110000,
    discountPercent: 5,
    tours: ["cham", "hoian"],
    aliases: [
      "combo 2", "sea and heritage", "sea & heritage",
      "combo biển hội an", "combo cù lao chàm hội an",
      "море и наследие", "остров чам хойан"
    ],
    names: {
      vi: "Combo 2 – Biển & Di sản",
      en: "Combo 2 – Sea & Heritage",
      ru: "Комбо 2 – Море и наследие"
    },
    summary: {
      vi: "2 ngày 1 đêm: Cù Lao Chàm lặn ngắm san hô; Rừng dừa thuyền thúng + Phố cổ Hội An.",
      en: "2 days / 1 night: Cham Island snorkeling; Coconut Forest basket boat + Hoi An Ancient Town.",
      ru: "2 дня / 1 ночь: остров Чам и снорклинг; кокосовый лес, лодки-корзины и Старый город Хойана."
    },
    bestFor: {
      vi: ["Khách Nga", "Người trẻ", "Cặp đôi", "Gia đình có trẻ em", "Khách chỉ có 2 ngày"],
      en: ["Russian travelers", "Young travelers", "Couples", "Families with children", "Guests with only 2 days"],
      ru: ["Русские путешественники", "Молодёжь", "Пары", "Семьи с детьми", "Гости только на 2 дня"]
    },
    weatherDependent: true
  },

  combo3: {
    id: "combo3",
    code: "COMBO 3",
    duration: { days: 3, nights: 2 },
    pricePerPerson: 3500000,
    individualTotal: 3750000,
    savingPerPerson: 250000,
    discountPercent: 6.5,
    tours: ["bana", "cham", "hoian"],
    aliases: [
      "combo 3", "top 3 central vietnam", "top 3 miền trung",
      "combo bà nà cù lao chàm hội an",
      "топ 3 центрального вьетнама",
      "бана чам хойан"
    ],
    names: {
      vi: "Combo 3 – Top 3 Miền Trung",
      en: "Combo 3 – Top 3 Central Vietnam",
      ru: "Комбо 3 – Топ 3 Центрального Вьетнама"
    },
    summary: {
      vi: "3 ngày 2 đêm: Bà Nà Hills; Cù Lao Chàm; Rừng dừa thuyền thúng + Phố cổ Hội An.",
      en: "3 days / 2 nights: Ba Na Hills; Cham Island; Coconut Forest basket boat + Hoi An Ancient Town.",
      ru: "3 дня / 2 ночи: Бана Хиллс; остров Чам; кокосовый лес, лодки-корзины и Старый город Хойана."
    },
    bestFor: {
      vi: ["Khách lần đầu", "Gia đình", "Cặp đôi", "Khách Nga", "Lưu trú 4–6 ngày"],
      en: ["First-time visitors", "Families", "Couples", "Russian travelers", "4–6 day stays"],
      ru: ["Первый визит", "Семьи", "Пары", "Русские путешественники", "Проживание 4–6 дней"]
    },
    weatherDependent: true
  },

  combo4: {
    id: "combo4",
    code: "COMBO 4",
    duration: { days: 3, nights: 2 },
    pricePerPerson: 3995000,
    individualTotal: 4250000,
    savingPerPerson: 255000,
    discountPercent: 6,
    tours: ["bana", "hoian", "hue"],
    aliases: [
      "combo 4", "central vietnam heritage",
      "central vietnam cultural journey",
      "combo di sản miền trung",
      "combo bà nà hội an huế",
      "культурное путешествие по центральному вьетнаму",
      "бана хойан хуэ"
    ],
    names: {
      vi: "Combo 4 – Di sản Miền Trung",
      en: "Combo 4 – Central Vietnam Heritage",
      ru: "Комбо 4 – Культурное путешествие по Центральному Вьетнаму"
    },
    summary: {
      vi: "3 ngày 2 đêm: Bà Nà Hills; Rừng dừa + Hội An; Cố đô Huế.",
      en: "3 days / 2 nights: Ba Na Hills; Coconut Forest + Hoi An; Hue Imperial City.",
      ru: "3 дня / 2 ночи: Бана Хиллс; кокосовый лес + Хойан; Императорский город Хюэ."
    },
    bestFor: {
      vi: ["Khách châu Âu", "Người lớn tuổi", "Gia đình", "Người yêu lịch sử", "Lưu trú 4–6 ngày"],
      en: ["European travelers", "Seniors", "Families", "History lovers", "4–6 day stays"],
      ru: ["Европейские путешественники", "Пожилые гости", "Семьи", "Любители истории", "Проживание 4–6 дней"]
    }
  }
};

function detectCombo(text) {
  for (const combo of Object.values(COMBO_BOOK)) {
    if (combo.aliases.some((alias) => text.includes(alias))) {
      return combo.id;
    }
  }

  const direct = text.match(/\bcombo\s*([1-4])\b/i);

  if (direct) {
    return `combo${direct[1]}`;
  }

  return null;
}

function comboName(comboId, lang) {
  return COMBO_BOOK[comboId]?.names?.[lang] || comboId;
}

function comboPriceAnswer(comboId, lang, guestCount = null) {
  const combo = COMBO_BOOK[comboId];

  if (!combo) return null;

  const total = guestCount
    ? combo.pricePerPerson * guestCount
    : null;

  const lines = {
    vi: [
      `🌿 ${combo.names.vi}`,
      combo.summary.vi,
      "",
      `• Giá combo: ${formatVND(combo.pricePerPerson)}/người`,
      `• Tiết kiệm: ${formatVND(combo.savingPerPerson)}/người`,
      guestCount ? `• ${guestCount} khách: ${formatVND(total)}` : null,
      "",
      "Giá áp dụng với hướng dẫn viên tiếng Anh. Hướng dẫn viên tiếng Nga: vui lòng liên hệ GoVietStay để xác nhận.",
      combo.weatherDependent
        ? "Lưu ý: phần Cù Lao Chàm phụ thuộc tình trạng biển và quyết định của cảng."
        : null
    ],
    en: [
      `🌿 ${combo.names.en}`,
      combo.summary.en,
      "",
      `• Combo price: ${formatVND(combo.pricePerPerson)} per person`,
      `• Saving: ${formatVND(combo.savingPerPerson)} per person`,
      guestCount ? `• ${guestCount} guests: ${formatVND(total)}` : null,
      "",
      "The listed price applies with an English-speaking guide. For a Russian-speaking guide, please contact GoVietStay for confirmation.",
      combo.weatherDependent
        ? "Note: the Cham Island day depends on sea conditions and port approval."
        : null
    ],
    ru: [
      `🌿 ${combo.names.ru}`,
      combo.summary.ru,
      "",
      `• Цена комбо: ${formatVND(combo.pricePerPerson)} с человека`,
      `• Экономия: ${formatVND(combo.savingPerPerson)} с человека`,
      guestCount ? `• ${guestCount} гостей: ${formatVND(total)}` : null,
      "",
      "Указанная цена действует с англоговорящим гидом. Русскоговорящий гид — по запросу, стоимость подтверждает GoVietStay.",
      combo.weatherDependent
        ? "Важно: день на острове Чам зависит от состояния моря и разрешения порта."
        : null
    ]
  };

  return answer(
    lines[lang].filter(Boolean).join("\n"),
    guestCount ? null : "guest_count",
    { comboId, comboPricingFlow: true },
    true
  );
}

function comboRecommendationAnswer(lang) {
  const lines = {
    vi: [
      "🌿 Gợi ý nhanh:",
      "• Combo 1: lần đầu đến Đà Nẵng, 2 ngày, Bà Nà + Hội An.",
      "• Combo 2: thích biển, Cù Lao Chàm + Hội An.",
      "• Combo 3: đủ núi – biển – phố cổ trong 3 ngày.",
      "• Combo 4: thiên về văn hóa, Hội An + Huế.",
      "",
      "Bạn có bao nhiêu ngày và đi cùng ai?"
    ],
    en: [
      "🌿 Quick recommendation:",
      "• Combo 1: first visit, 2 days, Ba Na + Hoi An.",
      "• Combo 2: sea lovers, Cham Island + Hoi An.",
      "• Combo 3: mountain, sea, and heritage in 3 days.",
      "• Combo 4: culture-focused, Hoi An + Hue.",
      "",
      "How many days do you have, and who are you traveling with?"
    ],
    ru: [
      "🌿 Быстрая рекомендация:",
      "• Комбо 1: первый визит, 2 дня, Бана + Хойан.",
      "• Комбо 2: море, остров Чам + Хойан.",
      "• Комбо 3: горы, море и наследие за 3 дня.",
      "• Комбо 4: культура, Хойан + Хюэ.",
      "",
      "Сколько у вас дней и с кем вы путешествуете?"
    ]
  };

  return answer(lines[lang], "combo_profile");
}

function buildWhatsAppUrl(context, lang) {
  const labels = {
    vi: {
      title: "Yêu cầu từ Đào",
      service: "Dịch vụ",
      date: "Ngày",
      guests: "Số khách",
      area: "Khu vực",
      hotel: "Khách sạn",
      language: "Ngôn ngữ"
    },
    en: {
      title: "Request from Đào",
      service: "Service",
      date: "Date",
      guests: "Guests",
      area: "Area",
      hotel: "Hotel",
      language: "Language"
    },
    ru: {
      title: "Запрос от Дао",
      service: "Услуга",
      date: "Дата",
      guests: "Гостей",
      area: "Район",
      hotel: "Отель",
      language: "Язык"
    }
  };

  const L = labels[lang];
  const service = context.activeCombo
    ? comboName(context.activeCombo, lang)
    : localizedTopic(context.activeTopic, lang);

  const rows = [
    L.title,
    `${L.service}: ${service || "GoVietStay"}`,
    context.travelDate ? `${L.date}: ${context.travelDate}` : null,
    context.guestCount ? `${L.guests}: ${context.guestCount}` : null,
    context.location ? `${L.area}: ${locationName(context.location, lang)}` : null,
    context.hotel ? `${L.hotel}: ${context.hotel}` : null,
    `${L.language}: ${lang.toUpperCase()}`
  ].filter(Boolean);

  return `https://wa.me/84937762607?text=${encodeURIComponent(rows.join("\n"))}`;
}

/* =========================================================
   TELEGRAM API
========================================================= */

async function telegram(method, body) {
  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!data.ok) {
    console.error("Telegram API error:", method, data);
  }

  return data;
}

async function sendMessage(chatId, text, extra = {}) {
  return telegram("sendMessage", {
    chat_id: chatId,
    text,
    ...extra,
  });
}

async function sendTyping(chatId) {
  return telegram("sendChatAction", {
    chat_id: chatId,
    action: "typing",
  });
}

async function pinMessage(chatId, messageId) {
  return telegram("pinChatMessage", {
    chat_id: chatId,
    message_id: messageId,
    disable_notification: true,
  });
}

async function answerCallbackQuery(callbackQueryId, text = "") {
  return telegram("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: false,
  });
}

/* =========================================================
   HELPERS
========================================================= */

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!;:()[\]{}"'«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function random(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function unique(items) {
  return [...new Set(items)];
}

function formatVND(value) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
}

function contextKey(message) {
  return `${message.chat.id}:${message.from?.id || "unknown"}`;
}

function locationName(location, lang) {
  const names = {
    danang: { vi: "Đà Nẵng", en: "Da Nang", ru: "Дананг" },
    hoian: { vi: "Hội An", en: "Hoi An", ru: "Хойан" },
    hue: { vi: "Huế", en: "Hue", ru: "Хюэ" },
  };

  return names[location]?.[lang] || location;
}

/* =========================================================
   LANGUAGE DETECTION — VI / EN / RU
========================================================= */

const LANGUAGE_MARKERS = {
  vi: [
    "xin chào", "chào", "vui lòng", "thông tin", "cho tôi biết",
    "giá", "bao nhiêu", "người", "trẻ em", "ngày mai", "hôm nay",
    "đi", "được không", "ở đâu", "khách sạn", "đặt tour", "tôi",
    "mình", "anh", "chị", "vé", "xe", "sân bay", "thời tiết",
    "mưa", "ăn", "nhà hàng", "đón", "đưa", "có", "không",
  ],
  en: [
    "hello", "hi", "please", "english", "information", "info",
    "tell me", "give me", "about", "what", "which", "when",
    "price", "how much", "people", "person", "child", "children",
    "tomorrow", "today", "hotel", "book", "booking", "tour",
    "airport", "weather", "rain", "restaurant", "transfer",
    "where", "can", "want", "need", "adult", "ticket", "private",
  ],
  ru: [
    "цена", "сколько", "человек", "ребенок", "ребёнок", "дети",
    "завтра", "сегодня", "отель", "забронировать", "тур",
    "аэропорт", "погода", "дождь", "ресторан", "трансфер",
    "где", "можно", "хочу", "нужно", "взрослый", "билет",
    "частный", "экскурсия",
  ],
};

function telegramLanguage(languageCode = "") {
  const code = String(languageCode).toLowerCase();

  if (code.startsWith("vi")) return "vi";
  if (code.startsWith("en")) return "en";
  if (code.startsWith("ru")) return "ru";

  return null;
}


function detectExplicitLanguageSwitch(rawText) {
  const text = normalize(rawText);

  const commands = {
    en: [
      "english please",
      "speak english",
      "in english",
      "english",
      "tiếng anh",
      "tieng anh",
      "английский",
      "на английском",
      "по английски",
    ],
    vi: [
      "tiếng việt",
      "tieng viet",
      "nói tiếng việt",
      "noi tieng viet",
      "vietnamese please",
      "speak vietnamese",
      "in vietnamese",
      "вьетнамский",
      "на вьетнамском",
    ],
    ru: [
      "русский",
      "по русски",
      "по-русски",
      "на русском",
      "russian please",
      "speak russian",
      "in russian",
      "tiếng nga",
      "tieng nga",
    ],
  };

  for (const [lang, phrases] of Object.entries(commands)) {
    if (phrases.some((phrase) => text === phrase || text.includes(phrase))) {
      return lang;
    }
  }

  return null;
}

function detectLanguage(rawText, context, telegramCode) {
  const explicitSwitch = detectExplicitLanguageSwitch(rawText);

  if (explicitSwitch) {
    return explicitSwitch;
  }

  const text = normalize(rawText);

  if (/[а-яА-ЯёЁ]/.test(rawText)) {
    return "ru";
  }

  if (/[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(rawText)) {
    return "vi";
  }

  const scores = { vi: 0, en: 0, ru: 0 };

  for (const [lang, markers] of Object.entries(LANGUAGE_MARKERS)) {
    for (const marker of markers) {
      if (text.includes(marker)) {
        scores[lang] += marker.includes(" ") ? 3 : 1;
      }
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  if (best[1] > 0) {
    return best[0];
  }

  // Very short or language-neutral messages such as "Ba Na", "2", "ok":
  // preserve the conversation language, then use Telegram language_code.
  return context.language ||
    telegramLanguage(telegramCode) ||
    DEFAULT_LANGUAGE;
}

/* =========================================================
   TRANSLATION DICTIONARY
========================================================= */

const T = {
  welcome: {
    vi: (name) => `🌿 Xin chào ${name}!

Tôi là Đào — trợ lý địa phương của GoVietStay tại Việt Nam 🇻🇳

Tôi hỗ trợ khách bằng tiếng Việt, English và Русский tại Đà Nẵng, Hội An, Huế và miền Trung Việt Nam.

Bạn có thể hỏi về Cù Lao Chàm, Bà Nà Hills, Hội An, Huế, đón sân bay, visa, SIM, ăn uống hoặc lịch trình dành cho trẻ em và người lớn tuổi.

Tôi sẽ cố gắng hiểu tình huống của bạn trước khi đề xuất dịch vụ.

Hãy gửi câu hỏi của bạn nhé 🌿`,

    en: (name) => `🌿 Hello ${name}!

I’m Đào — GoVietStay’s local travel assistant in Vietnam 🇻🇳

I can support travelers in Vietnamese, English, and Russian across Da Nang, Hoi An, Hue, and Central Vietnam.

You can ask about Cham Island, Ba Na Hills, Hoi An, Hue, airport transfers, visas, SIM cards, food, or trips with children and elderly family members.

I’ll first understand your situation before recommending a service.

Just send me your question 🌿`,

    ru: (name) => `🌿 Здравствуйте, ${name}!

Я Дао — местный помощник GoVietStay во Вьетнаме 🇻🇳

Я помогаю путешественникам на русском, английском и вьетнамском языках в Дананге, Хойане, Хюэ и Центральном Вьетнаме.

Можно спросить меня о Чамских островах, Бана Хиллс, Хойане, Хюэ, трансфере, визе, SIM-карте, еде или поездке с детьми и пожилыми родственниками.

Сначала я постараюсь понять вашу ситуацию, а уже потом предложу услугу.

Просто напишите свой вопрос 🌿`,
  },

  askGuests: {
    vi: "Bạn đi bao nhiêu người?",
    en: "How many people are traveling?",
    ru: "Сколько человек у вас?",
  },

  askDate: {
    vi: "Bạn dự định đi ngày nào?",
    en: "What date are you planning to go?",
    ru: "На какую дату вы планируете поездку?",
  },

  askLocation: {
    vi: "Bạn đang ở Đà Nẵng hay Hội An?",
    en: "Are you staying in Da Nang or Hoi An?",
    ru: "Вы сейчас живёте в Дананге или Хойане?",
  },

  askChildren: {
    vi: "Bạn đi cùng trẻ em hay chỉ có người lớn?",
    en: "Are you traveling with children or adults only?",
    ru: "Вы путешествуете с детьми или только со взрослыми?",
  },

  askChildAges: {
    vi: "Các bé bao nhiêu tuổi?",
    en: "How old are the children?",
    ru: "Сколько лет детям?",
  },

  notUnderstood: {
    vi: "Có vẻ tôi chưa hiểu đúng ý bạn 😊 Bạn nói rõ hơn một câu nhé.",
    en: "I may not have understood correctly 😊 Please explain in one short sentence.",
    ru: "Кажется, я немного не поняла 😊 Напишите чуть подробнее одним предложением.",
  },

  hotLead: {
    vi: "Tôi đã tổng hợp yêu cầu của bạn. Bạn có thể chuyển thông tin này cho đội ngũ GoVietStay để nhận xác nhận chính xác.",
    en: "I’ve summarized your request. You can send it to the GoVietStay team for an exact confirmation.",
    ru: "Я собрала ваш запрос. Его можно передать команде GoVietStay для точного подтверждения.",
  },
};

/* =========================================================
   CONTEXT
========================================================= */

function createContext() {
  return {
    version: 7,
    language: null,
    lastIntent: null,
    activeTopic: null,
    activeCombo: null,
    previousTopic: null,

    pendingQuestion: null,
    pendingData: {},

    location: null,
    hotel: null,
    guestCount: null,
    travelDate: null,
    travelDateRaw: null,

    children: false,
    childAges: [],
    mobility: null,

    preferredTour: null,
    serviceType: null,

    bookingIntent: 0,
    leadScore: 0,
    leadStage: "cold",
    handoffOffered: false,

    conversationOpenUntil: 0,
    updatedAt: Date.now(),
  };
}

function getContext(message) {
  const key = contextKey(message);
  const saved = conversations.get(key);

  if (!saved) return createContext();

  if (Date.now() - saved.updatedAt > CONTEXT_TTL) {
    conversations.delete(key);
    return createContext();
  }

  return { ...createContext(), ...saved };
}

function saveContext(message, context) {
  context.updatedAt = Date.now();
  conversations.set(contextKey(message), context);
}

function openConversation(context) {
  context.conversationOpenUntil = Date.now() + CONTEXT_TTL;
}

function isConversationOpen(context) {
  return context.conversationOpenUntil > Date.now();
}

function setPending(context, question, data = {}) {
  context.pendingQuestion = question;
  context.pendingData = data;
  openConversation(context);
}

function clearPending(context) {
  context.pendingQuestion = null;
  context.pendingData = {};
}

function setTopic(context, topic) {
  if (context.activeTopic && context.activeTopic !== topic) {
    context.previousTopic = context.activeTopic;
  }

  context.activeTopic = topic;

  if (["bana", "cham", "hoian", "hue"].includes(topic)) {
    context.preferredTour = topic;
  }
}

/* =========================================================
   ENTITY EXTRACTION
========================================================= */

function detectLocation(text) {
  if (includesAny(text, ["đà nẵng", "da nang", "дананг", "дананге"])) {
    return "danang";
  }

  if (includesAny(text, ["hội an", "hoi an", "хойан", "хойане"])) {
    return "hoian";
  }

  if (includesAny(text, ["huế", "hue", "хуэ", "хюэ"])) {
    return "hue";
  }

  return null;
}

function extractNumbers(text) {
  return (text.match(/\b\d{1,3}\b/g) || []).map(Number);
}

function extractAges(text) {
  return extractNumbers(text).filter((n) => n >= 0 && n <= 17);
}

function extractGuestCount(text) {
  const patterns = [
    /(\d{1,2})\s*(?:người|khách|people|persons?|guests?|adults?|человек|гост)/,
    /(?:chúng tôi|bọn tôi|nhóm tôi|we are|there are|нас|мы)\s*(\d{1,2})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const count = Number(match[1]);
      if (count > 0 && count <= 50) return count;
    }
  }

  return null;
}

function parseTravelDate(text) {
  const now = new Date();
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const iso = (date) => date.toISOString().slice(0, 10);

  if (includesAny(text, ["hôm nay", "today", "сегодня"])) {
    return { value: iso(vn), raw: "today" };
  }

  if (includesAny(text, ["ngày mai", "mai", "tomorrow", "завтра"])) {
    const date = new Date(vn);
    date.setUTCDate(date.getUTCDate() + 1);
    return { value: iso(date), raw: "tomorrow" };
  }

  if (includesAny(text, ["ngày kia", "day after tomorrow", "послезавтра"])) {
    const date = new Date(vn);
    date.setUTCDate(date.getUTCDate() + 2);
    return { value: iso(date), raw: "day after tomorrow" };
  }

  const match = text.match(
    /\b([0-3]?\d)[./-]([01]?\d)(?:[./-](20\d{2}|\d{2}))?\b/
  );

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = match[3] ? Number(match[3]) : vn.getUTCFullYear();

  if (year < 100) year += 2000;

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return null;
  }

  return {
    value: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    raw: match[0],
  };
}

function extractHotel(text) {
  const patterns = [
    /(?:khách sạn|hotel|отель)\s+(.{2,80})/i,
    /(?:ở|staying at|живем в|живём в)\s+(.{2,80})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return null;
}

function enrichContext(text, context) {
  const location = detectLocation(text);
  if (location) context.location = location;

  const guests = extractGuestCount(text);
  if (guests) context.guestCount = guests;

  const date = parseTravelDate(text);
  if (date) {
    context.travelDate = date.value;
    context.travelDateRaw = date.raw;
  }

  const hotel = extractHotel(text);
  if (hotel) context.hotel = hotel;

  if (includesAny(text, [
    "trẻ em", "em bé", "con tôi", "child", "children",
    "ребенок", "ребёнок", "дети", "с детьми",
  ])) {
    context.children = true;
  }
}

/* =========================================================
   INTENT DETECTION — MULTILINGUAL
========================================================= */

const INTENTS = [
  {
    id: "bana",
    words: [
      "bà nà", "ba na", "bana", "golden bridge", "cầu vàng",
      "бана", "золотой мост", "канатная дорога",
    ],
  },
  {
    id: "cham",
    words: [
      "cù lao chàm", "cu lao cham", "cham island", "snorkeling",
      "lặn ngắm san hô", "чам", "чамские острова", "снорклинг",
    ],
  },
  {
    id: "hoian",
    words: [
      "hội an", "hoi an", "phố cổ", "rừng dừa", "thuyền thúng",
      "хойан", "старый город", "кокосовый лес", "лодка корзина",
    ],
  },
  {
    id: "hue",
    words: [
      "huế", "hue", "đại nội", "kinh thành",
      "хуэ", "хюэ", "цитадель", "императорский город",
    ],
  },
  {
    id: "airport",
    words: [
      "sân bay", "đón sân bay", "airport", "airport transfer",
      "аэропорт", "трансфер",
    ],
  },
  {
    id: "visa",
    words: [
      "visa", "evisa", "e-visa", "thị thực",
      "виза", "электронная виза",
    ],
  },

  {
    id: "combo",
    words: [
      "combo", "com bo", "package", "multi day",
      "nhiều ngày", "gói tour", "комбо", "пакетный тур"
    ],
  },
  {
    id: "price",
    words: [
      "giá", "giá sao", "bao nhiêu", "chi phí",
      "price", "how much", "cost",
      "цена", "сколько стоит", "стоимость",
    ],
  },
  {
    id: "booking",
    words: [
      "đặt tour", "đặt vé", "đặt ngay", "muốn đặt",
      "book", "booking", "reserve", "want to book",
      "забронировать", "заказать", "хочу заказать",
    ],
  },
  {
    id: "children",
    words: [
      "trẻ em", "em bé", "con nhỏ",
      "child", "children", "baby",
      "ребенок", "ребёнок", "дети", "малыш",
    ],
  },
  {
    id: "elderly",
    words: [
      "người lớn tuổi", "khó đi lại", "xe lăn", "đột quỵ",
      "elderly", "wheelchair", "limited mobility", "stroke",
      "пожилой", "пожилые", "коляска", "плохо ходит", "инсульт",
    ],
  },
  {
    id: "weather",
    words: [
      "thời tiết", "mưa", "biển động", "sóng",
      "weather", "rain", "rough sea", "waves",
      "погода", "дождь", "шторм", "волны",
    ],
  },
  {
    id: "food",
    words: [
      "ăn gì", "nhà hàng", "đồ ăn", "hải sản",
      "food", "restaurant", "seafood",
      "еда", "ресторан", "морепродукты",
    ],
  },
  {
    id: "sim",
    words: [
      "sim", "esim", "internet", "4g", "5g",
      "сим", "интернет", "связь",
    ],
  },
  {
    id: "medicine",
    words: [
      "nhà thuốc", "thuốc", "bệnh viện", "bị đau", "bị sốt",
      "pharmacy", "medicine", "hospital", "fever", "pain",
      "аптека", "лекарство", "больница", "температура", "болит",
    ],
  },
  {
    id: "tour",
    words: [
      "tour", "chuyến đi", "lịch trình", "tham quan",
      "trip", "itinerary", "excursion",
      "тур", "поездка", "маршрут", "экскурсия",
    ],
  },
];

function detectIntent(text) {
  let best = null;

  for (const intent of INTENTS) {
    let score = 0;

    for (const word of intent.words) {
      if (text.includes(word)) {
        score += word.includes(" ") ? 3 : 1;
      }
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { id: intent.id, score };
    }
  }

  return best?.id || null;
}

function topicForPrice(context) {
  if (PRICE_BOOK[context.activeTopic]) return context.activeTopic;
  if (PRICE_BOOK[context.lastIntent]) return context.lastIntent;
  if (PRICE_BOOK[context.preferredTour]) return context.preferredTour;
  return null;
}

/* =========================================================
   GROUP REPLY CONTROL
========================================================= */

function wasReplyToDao(message) {
  return message.reply_to_message?.from?.username === BOT_USERNAME;
}

function isQuestion(text) {
  return (
    text.includes("?") ||
    includesAny(text, [
      "giá", "bao nhiêu", "ở đâu", "được không", "thế nào",
      "how", "where", "can", "should", "price",
      "как", "где", "можно", "стоит", "сколько",
    ])
  );
}

function shouldReply(message, text, intent, context) {
  if (message.chat?.type === "private") return true;

  const called = includesAny(text, [
    "đào", "dao", "дао", `@${BOT_USERNAME}`,
  ]);

  if (called || wasReplyToDao(message)) return true;

  if (context.pendingQuestion && isConversationOpen(context)) {
    return true;
  }

  return Boolean(intent && isQuestion(text));
}

/* =========================================================
   BUTTONS
========================================================= */

function buttons(lang, context = null) {
  const labels = {
    vi: ["🇻🇳 Mở Mini App", "💬 WhatsApp GoVietStay"],
    en: ["🇻🇳 Open Mini App", "💬 WhatsApp GoVietStay"],
    ru: ["🇻🇳 Открыть Mini App", "💬 WhatsApp GoVietStay"],
  };

  return {
    inline_keyboard: [
      [{ text: labels[lang][0], web_app: { url: MINI_APP_URL } }],
      [{
        text: labels[lang][1],
        url: context ? buildWhatsAppUrl(context, lang) : WHATSAPP_URL,
      }],
    ],
  };
}

function mainMenuButtons(lang, context = null) {
  const L = {
    vi: {
      tours: "🏝 Tour nổi bật", cham: "🐠 Cù Lao Chàm", bana: "🌉 Bà Nà Hills",
      hoian: "🏮 Hội An", hue: "🏯 Huế", airport: "🚕 Đón sân bay",
      visa: "📄 Visa", combos: "🎁 Combo tour", app: "🇻🇳 Mở Mini App",
      whatsapp: "💬 WhatsApp", reviews: "⭐ Google Reviews", help: "👩‍💼 Hỗ trợ tiếng Nga"
    },
    en: {
      tours: "🏝 Featured Tours", cham: "🐠 Cham Island", bana: "🌉 Ba Na Hills",
      hoian: "🏮 Hoi An", hue: "🏯 Hue", airport: "🚕 Airport Transfer",
      visa: "📄 Visa", combos: "🎁 Tour Combos", app: "🇻🇳 Open Mini App",
      whatsapp: "💬 WhatsApp", reviews: "⭐ Google Reviews", help: "👩‍💼 Russian Support"
    },
    ru: {
      tours: "🏝 Популярные экскурсии", cham: "🐠 Остров Чам", bana: "🌉 Бана Хиллс",
      hoian: "🏮 Хойан", hue: "🏯 Хюэ", airport: "🚕 Трансфер из аэропорта",
      visa: "📄 Виза", combos: "🎁 Комбо-туры", app: "🇻🇳 Открыть Mini App",
      whatsapp: "💬 WhatsApp", reviews: "⭐ Отзывы Google", help: "👩‍💼 Поддержка на русском"
    },
  }[lang];

  return {
    inline_keyboard: [
      [{ text: L.tours, callback_data: "menu:tours" }],
      [
        { text: L.cham, callback_data: "topic:cham" },
        { text: L.bana, callback_data: "topic:bana" },
      ],
      [
        { text: L.hoian, callback_data: "topic:hoian" },
        { text: L.hue, callback_data: "topic:hue" },
      ],
      [
        { text: L.airport, callback_data: "topic:airport" },
        { text: L.visa, callback_data: "topic:visa" },
      ],
      [{ text: L.combos, callback_data: "menu:combos" }],
      [{ text: L.app, web_app: { url: MINI_APP_URL } }],
      [
        { text: L.whatsapp, url: context ? buildWhatsAppUrl(context, lang) : WHATSAPP_URL },
        { text: L.reviews, url: "https://maps.app.goo.gl/znWBmL8zPKEJqnoW6?g_st=ic" },
      ],
      [{ text: L.help, url: "https://wa.me/84937762607?text=" + encodeURIComponent(
        lang === "ru"
          ? "Здравствуйте! Мне нужна поддержка на русском языке."
          : lang === "vi"
            ? "Xin chào! Tôi cần hỗ trợ bằng tiếng Nga."
            : "Hello! I need Russian-language support."
      ) }],
    ],
  };
}

function menuText(lang) {
  return {
    vi: "🌿 GoVietStay — Trợ lý du lịch miền Trung Việt Nam\n\nChọn mục bên dưới để xem tour, đặt xe, làm visa hoặc liên hệ hỗ trợ. Trong nhóm, bạn cũng có thể gọi @govietstay_travel_bot và đặt câu hỏi.",
    en: "🌿 GoVietStay — Central Vietnam Travel Assistant\n\nChoose an option below for tours, transfers, visas, or local support. In the group, you can also mention @govietstay_travel_bot and ask a question.",
    ru: "🌿 GoVietStay — помощник по Центральному Вьетнаму\n\nВыберите раздел ниже: экскурсии, трансфер, виза или поддержка. В группе также можно упомянуть @govietstay_travel_bot и задать вопрос.",
  }[lang];
}

function toursMenuText(lang) {
  return {
    vi: "🏝 Tour nổi bật của GoVietStay\n\nChọn điểm đến để xem thông tin, giá tham khảo và bắt đầu yêu cầu đặt tour.",
    en: "🏝 Featured GoVietStay tours\n\nChoose a destination to see details, reference pricing, and start a booking request.",
    ru: "🏝 Популярные экскурсии GoVietStay\n\nВыберите направление, чтобы узнать детали, ориентировочную цену и начать бронирование.",
  }[lang];
}

function comboMenuText(lang) {
  const lines = {
    vi: ["🎁 Combo tour GoVietStay", "", "1️⃣ Classic Đà Nẵng — Bà Nà + Hội An: 2.660.000 VND/người", "2️⃣ Biển & Di sản — Cù Lao Chàm + Hội An: 2.090.000 VND/người", "3️⃣ Top 3 Miền Trung — Bà Nà + Cù Lao Chàm + Hội An: 3.500.000 VND/người", "4️⃣ Di sản Miền Trung — Bà Nà + Hội An + Huế: 3.995.000 VND/người", "", "Giá áp dụng với hướng dẫn viên tiếng Anh. Hướng dẫn viên tiếng Nga vui lòng liên hệ để xác nhận."],
    en: ["🎁 GoVietStay tour combos", "", "1️⃣ Classic Da Nang — Ba Na + Hoi An: 2,660,000 VND/person", "2️⃣ Sea & Heritage — Cham Island + Hoi An: 2,090,000 VND/person", "3️⃣ Top 3 Central Vietnam — Ba Na + Cham Island + Hoi An: 3,500,000 VND/person", "4️⃣ Central Vietnam Heritage — Ba Na + Hoi An + Hue: 3,995,000 VND/person", "", "Prices apply with an English-speaking guide. Contact us to confirm a Russian-speaking guide."],
    ru: ["🎁 Комбо-туры GoVietStay", "", "1️⃣ Классический Дананг — Бана + Хойан: 2 660 000 VND/чел.", "2️⃣ Море и наследие — остров Чам + Хойан: 2 090 000 VND/чел.", "3️⃣ Топ-3 Центрального Вьетнама — Бана + Чам + Хойан: 3 500 000 VND/чел.", "4️⃣ Наследие Центрального Вьетнама — Бана + Хойан + Хюэ: 3 995 000 VND/чел.", "", "Цены указаны с англоговорящим гидом. Русскоговорящий гид подтверждается отдельно."],
  };
  return lines[lang].join("\n");
}

/* =========================================================
   ANSWER BUILDERS
========================================================= */

function answer(text, question = null, data = {}, showButtons = false) {
  return { text, question, data, showButtons };
}

function priceAnswer(topic, lang) {
  const item = PRICE_BOOK[topic];

  if (!item) {
    return answer({
      vi: "Bạn đang hỏi giá dịch vụ nào: Bà Nà, Cù Lao Chàm, Hội An, đón sân bay hay visa?",
      en: "Which service price do you mean: Ba Na, Cham Island, Hoi An, airport transfer, or visa?",
      ru: "Какую цену вы хотите узнать: Бана Хиллс, Чамские острова, Хойан, трансфер или визу?",
    }[lang], "price_topic");
  }

  return answer(
    `${item.notes[lang]}

${{
  vi: "Để tính tổng chính xác, bạn đi bao nhiêu người?",
  en: "To calculate the exact total, how many people are traveling?",
  ru: "Чтобы рассчитать точную сумму, сколько человек будет?",
}[lang]}`,
    "guest_count",
    { topic, pricingFlow: true },
    true
  );
}

function topicAnswer(topic, context, lang) {
  setTopic(context, topic);

  if (topic === "bana") {
    return answer({
      vi: `Bà Nà Hills phù hợp để tham quan Cầu Vàng, đi cáp treo và tận hưởng không khí trên núi 🌉

${PRICE_BOOK.bana.notes.vi}

Bạn đi bao nhiêu người?`,
      en: `Ba Na Hills is worth visiting for the Golden Bridge, cable car, and mountain atmosphere 🌉

${PRICE_BOOK.bana.notes.en}

How many people are traveling?`,
      ru: `Бана Хиллс стоит посетить ради Золотого моста, канатной дороги и горной атмосферы 🌉

${PRICE_BOOK.bana.notes.ru}

Сколько человек у вас?`,
    }[lang], "guest_count", { topic: "bana" });
  }

  if (topic === "cham") {
    return answer({
      vi: `Cù Lao Chàm phù hợp cho trải nghiệm ca nô, đảo và lặn ngắm san hô 🏝

${PRICE_BOOK.cham.notes.vi}

Bạn đi cùng trẻ em hay chỉ có người lớn?`,
      en: `Cham Island is a good choice for a speedboat trip, island experience, and snorkeling 🏝

${PRICE_BOOK.cham.notes.en}

Are you traveling with children or adults only?`,
      ru: `Чамские острова подходят для поездки на скоростном катере, отдыха на острове и снорклинга 🏝

${PRICE_BOOK.cham.notes.ru}

Вы путешествуете с детьми или только со взрослыми?`,
    }[lang], "travel_party", { topic: "cham" });
  }

  if (topic === "hoian") {
    return answer({
      vi: `Hội An đẹp nhất từ chiều đến tối, khi phố cổ lên đèn 🏮

${PRICE_BOOK.hoian.notes.vi}

Bạn muốn đi riêng phố cổ hay kết hợp Rừng dừa?`,
      en: `Hoi An is especially beautiful from late afternoon into the evening, when the lanterns light up 🏮

${PRICE_BOOK.hoian.notes.en}

Would you like the Ancient Town only, or combine it with Coconut Forest?`,
      ru: `Хойан особенно красив с позднего дня до вечера, когда зажигаются фонари 🏮

${PRICE_BOOK.hoian.notes.ru}

Вы хотите только Старый город или Хойан вместе с кокосовым лесом?`,
    }[lang], "hoian_style", { topic: "hoian" });
  }

  if (topic === "hue") {
    return answer({
      vi: "Huế phù hợp với lịch trình cả ngày, thiên về lịch sử, văn hóa và kiến trúc cung đình 🏯\n\nBạn đi bao nhiêu người và dự định đi ngày nào?",
      en: "Hue is best planned as a full-day trip focused on history, culture, and imperial architecture 🏯\n\nHow many people are traveling, and what date are you considering?",
      ru: "Хюэ лучше планировать на целый день: история, культура и императорская архитектура 🏯\n\nСколько человек будет и на какую дату вы планируете поездку?",
    }[lang], "tour_details", { topic: "hue" });
  }

  if (topic === "airport") {
    context.serviceType = "airport";
    return answer({
      vi: `${PRICE_BOOK.airport.notes.vi}\n\nBạn cần đi Đà Nẵng hay Hội An?`,
      en: `${PRICE_BOOK.airport.notes.en}\n\nDo you need to go to Da Nang or Hoi An?`,
      ru: `${PRICE_BOOK.airport.notes.ru}\n\nВам нужно ехать в Дананг или Хойан?`,
    }[lang], "location", { topic: "airport" });
  }

  if (topic === "visa") {
    context.serviceType = "visa";
    return answer({
      vi: `${PRICE_BOOK.visa.notes.vi}\n\nBạn mang quốc tịch nào và dự định nhập cảnh ngày nào?`,
      en: `${PRICE_BOOK.visa.notes.en}\n\nWhat is your nationality, and when do you plan to enter Vietnam?`,
      ru: `${PRICE_BOOK.visa.notes.ru}\n\nКакое у вас гражданство и когда вы планируете въезд во Вьетнам?`,
    }[lang], "visa_details", { topic: "visa" });
  }

  return null;
}

function generalIntentAnswer(intent, context, lang) {
  if (intent === "combo") {
    if (context.activeCombo) {
      return comboPriceAnswer(context.activeCombo, lang, context.guestCount);
    }

    return comboRecommendationAnswer(lang);
  }

  if (["bana", "cham", "hoian", "hue", "airport", "visa"].includes(intent)) {
    return topicAnswer(intent, context, lang);
  }

  if (intent === "price") {
    if (context.activeCombo) {
      return comboPriceAnswer(context.activeCombo, lang, context.guestCount);
    }

    return priceAnswer(topicForPrice(context), lang);
  }

  if (intent === "booking") {
    context.bookingIntent += 4;

    if (!context.activeTopic) {
      return answer({
        vi: "Bạn muốn đặt dịch vụ nào: Bà Nà, Cù Lao Chàm, Hội An, Huế, đón sân bay hay visa?",
        en: "Which service would you like to book: Ba Na, Cham Island, Hoi An, Hue, airport transfer, or visa?",
        ru: "Какую услугу вы хотите забронировать: Бана Хиллс, Чамские острова, Хойан, Хюэ, трансфер или визу?",
      }[lang], "booking_topic");
    }

    if (!context.travelDate) {
      return answer(T.askDate[lang], "travel_date", {
        topic: context.activeTopic,
        bookingFlow: true,
      });
    }

    if (!context.guestCount) {
      return answer(T.askGuests[lang], "guest_count", {
        topic: context.activeTopic,
        bookingFlow: true,
      });
    }

    return buildLeadAnswer(context, lang);
  }

  if (intent === "children") {
    context.children = true;
    return answer(T.askChildAges[lang], "child_ages", {
      topic: context.activeTopic || "general",
    });
  }

  if (intent === "elderly") {
    context.mobility = "unknown";
    return answer({
      vi: "Với người lớn tuổi hoặc hạn chế vận động, lịch trình nên ít điểm, đi chậm và có xe ở gần 🌿\n\nNgười đó có thể tự lên xuống xe không?",
      en: "For elderly travelers or limited mobility, the itinerary should be slower, with fewer stops and the vehicle nearby 🌿\n\nCan the person get in and out of a car independently?",
      ru: "Для пожилого человека или при ограниченной подвижности маршрут должен быть спокойным, с небольшим количеством остановок и машиной рядом 🌿\n\nЧеловек может самостоятельно садиться в автомобиль и выходить из него?",
    }[lang], "mobility_car");
  }

  if (intent === "weather") {
    return answer({
      vi: "Với tour biển, không chỉ mưa mà tình trạng sóng, gió và quyết định của cảng cũng rất quan trọng 🌿\n\nBạn hỏi thời tiết cho ngày nào?",
      en: "For sea trips, rain is not the only factor. Waves, wind, and port approval are also important 🌿\n\nWhich date are you asking about?",
      ru: "Для морских поездок важен не только дождь. Нужно учитывать волны, ветер и решение порта 🌿\n\nО какой дате вы спрашиваете?",
    }[lang], "travel_date", {
      topic: context.activeTopic || "weather",
    });
  }

  if (intent === "food") {
    return answer({
      vi: "Bạn muốn món địa phương, hải sản hay một nhà hàng yên tĩnh cho gia đình? 🍜",
      en: "Would you prefer local food, seafood, or a quiet family restaurant? 🍜",
      ru: "Вы хотите местную кухню, морепродукты или спокойный семейный ресторан? 🍜",
    }[lang], "food_type");
  }

  if (intent === "sim") {
    return answer({
      vi: "SIM hoặc eSIM rất hữu ích để dùng bản đồ, Telegram và WhatsApp 📶\n\nBạn đang dùng điện thoại model nào?",
      en: "A SIM or eSIM is useful for maps, Telegram, and WhatsApp 📶\n\nWhat phone model are you using?",
      ru: "SIM или eSIM удобна для карт, Telegram и WhatsApp 📶\n\nКакая у вас модель телефона?",
    }[lang], "phone_model");
  }

  if (intent === "medicine") {
    return answer({
      vi: "Nếu tình trạng nghiêm trọng hoặc xấu đi nhanh, bạn nên liên hệ cơ sở y tế ngay. Tôi không chẩn đoán bệnh qua tin nhắn.\n\nBạn đang ở khu vực hoặc khách sạn nào?",
      en: "If the condition is serious or getting worse quickly, seek medical help immediately. I cannot diagnose through chat.\n\nWhich area or hotel are you in?",
      ru: "Если состояние серьёзное или быстро ухудшается, нужно сразу обратиться за медицинской помощью. Я не ставлю диагноз по переписке.\n\nВ каком районе или отеле вы находитесь?",
    }[lang], "hotel_or_area");
  }

  if (intent === "tour") {
    context.bookingIntent += 1;
    return answer({
      vi: "Tôi sẽ giúp chọn lịch trình phù hợp thay vì ép bạn vào một tour có sẵn 🌿\n\nBạn quan tâm biển, thiên nhiên, lịch sử hay trải nghiệm địa phương?",
      en: "I’ll help choose an itinerary that fits you rather than forcing a fixed tour 🌿\n\nAre you most interested in the sea, nature, history, or local experiences?",
      ru: "Я помогу подобрать маршрут под вас, а не просто предложить готовый тур 🌿\n\nЧто вам интереснее: море, природа, история или местная жизнь?",
    }[lang], "tour_interest");
  }

  return null;
}

/* =========================================================
   PENDING FLOW
========================================================= */

function yesNo(text, lang) {
  const yes = {
    vi: ["có", "được", "ừ", "đúng", "ok"],
    en: ["yes", "can", "ok", "sure"],
    ru: ["да", "может", "ага", "конечно"],
  };

  const no = {
    vi: ["không", "không thể"],
    en: ["no", "cannot", "can't"],
    ru: ["нет", "не может"],
  };

  if (yes[lang].some((w) => text === w || text.startsWith(`${w} `))) {
    return true;
  }

  if (no[lang].some((w) => text === w || text.startsWith(`${w} `))) {
    return false;
  }

  return null;
}

function handlePending(text, context, lang) {
  const q = context.pendingQuestion;
  const data = context.pendingData || {};

  if (!q) return null;

  if (q === "guest_count") {
    let count = extractGuestCount(text);
    const nums = extractNumbers(text);

    if (!count && nums.length === 1 && nums[0] >= 1 && nums[0] <= 50) {
      count = nums[0];
    }

    if (!count) {
      return answer(T.askGuests[lang], "guest_count", data);
    }

    context.guestCount = count;

    if (data.comboPricingFlow && data.comboId) {
      context.activeCombo = data.comboId;
      return comboPriceAnswer(data.comboId, lang, count);
    }

    if (data.bookingFlow) {
      if (!context.travelDate) {
        return answer(T.askDate[lang], "travel_date", {
          ...data,
          bookingFlow: true,
        });
      }

      return buildLeadAnswer(context, lang);
    }

    if (data.pricingFlow || data.topic) {
      if (!context.travelDate) {
        return answer(T.askDate[lang], "travel_date", {
          ...data,
          bookingFlow: true,
        });
      }

      return buildLeadAnswer(context, lang);
    }

    return answer({
      vi: `Đã rõ: ${count} người 🌿 Bạn dự định đi ngày nào?`,
      en: `Got it: ${count} people 🌿 What date are you planning?`,
      ru: `Поняла: ${count} человек 🌿 На какую дату вы планируете поездку?`,
    }[lang], "travel_date", data);
  }

  if (q === "travel_date") {
    const date = parseTravelDate(text);

    if (!date) {
      return answer({
        vi: "Bạn gửi ngày theo dạng: ngày mai, 18/07 hoặc 18.07.2026 nhé.",
        en: "Please send the date as tomorrow, 18/07, or 18.07.2026.",
        ru: "Напишите дату, например: завтра, 18/07 или 18.07.2026.",
      }[lang], "travel_date", data);
    }

    context.travelDate = date.value;
    context.travelDateRaw = date.raw;

    if (!context.guestCount && data.bookingFlow) {
      return answer(T.askGuests[lang], "guest_count", data);
    }

    if (context.guestCount) {
      return buildLeadAnswer(context, lang);
    }

    return answer(T.askGuests[lang], "guest_count", data);
  }

  if (q === "travel_party") {
    const hasChildren = includesAny(text, [
      "trẻ em", "em bé", "children", "child",
      "дети", "ребенок", "ребёнок",
    ]);

    if (hasChildren) {
      context.children = true;
      return answer(T.askChildAges[lang], "child_ages", data);
    }

    return answer(T.askGuests[lang], "guest_count", data);
  }

  if (q === "child_ages") {
    const ages = extractAges(text);

    if (!ages.length) {
      return answer(T.askChildAges[lang], "child_ages", data);
    }

    context.children = true;
    context.childAges = ages;

    const youngest = Math.min(...ages);

    return answer({
      vi: `Đã rõ, các bé ${ages.join(" và ")} tuổi 🌿${
        data.topic === "cham" && youngest <= 5
          ? " Với bé nhỏ, cần đặc biệt kiểm tra tình trạng biển vì ca nô có thể gây mệt."
          : ""
      }\n\nBạn dự định đi ngày nào?`,
      en: `Got it, the children are ${ages.join(" and ")} years old 🌿${
        data.topic === "cham" && youngest <= 5
          ? " With a young child, sea conditions are especially important because the speedboat can be tiring."
          : ""
      }\n\nWhat date are you planning?`,
      ru: `Поняла, детям ${ages.join(" и ")} лет 🌿${
        data.topic === "cham" && youngest <= 5
          ? " С маленьким ребёнком особенно важно проверить состояние моря, потому что скоростной катер может быть утомительным."
          : ""
      }\n\nНа какую дату вы планируете поездку?`,
    }[lang], "travel_date", {
      ...data,
      bookingFlow: true,
    });
  }

  if (q === "location") {
    const location = detectLocation(text);

    if (!location) {
      return answer(T.askLocation[lang], "location", data);
    }

    context.location = location;

    if (data.topic === "airport") {
      return answer(T.askDate[lang], "travel_date", {
        ...data,
        bookingFlow: true,
      });
    }

    return answer({
      vi: `Đã rõ, bạn ở ${locationName(location, lang)} 🌿 Bạn dự định đi ngày nào?`,
      en: `Got it, you are staying in ${locationName(location, lang)} 🌿 What date are you planning?`,
      ru: `Поняла, вы живёте в ${locationName(location, lang)} 🌿 На какую дату вы планируете поездку?`,
    }[lang], "travel_date", data);
  }

  if (q === "mobility_car") {
    const result = yesNo(text, lang);

    if (result === null) {
      return answer({
        vi: "Bạn chỉ cần trả lời: có hoặc không.",
        en: "Please answer simply: yes or no.",
        ru: "Можно ответить просто: да или нет.",
      }[lang], "mobility_car", data);
    }

    context.mobility = result ? "independent" : "needs_assistance";

    return answer({
      vi: result
        ? "Tốt, vậy có thể thiết kế lịch trình chậm, xe ở gần và thời gian nghỉ hợp lý 🌿 Bạn muốn đi đâu?"
        : "Vậy cần thiết kế rất kỹ việc lên xuống xe, khoảng cách đi bộ và cầu thang 🌿 Bạn muốn đi đâu?",
      en: result
        ? "Good. We can design a slower itinerary with the vehicle nearby and enough rest time 🌿 Where would you like to go?"
        : "Then we need to carefully plan vehicle access, walking distance, and stairs 🌿 Where would you like to go?",
      ru: result
        ? "Хорошо. Можно сделать спокойный маршрут с машиной рядом и достаточным временем для отдыха 🌿 Куда вы хотите поехать?"
        : "Тогда нужно особенно внимательно учитывать посадку в машину, расстояние пешком и лестницы 🌿 Куда вы хотите поехать?",
    }[lang]);
  }

  if (q === "price_topic" || q === "booking_topic") {
    const intent = detectIntent(text);

    if (["bana", "cham", "hoian", "hue", "airport", "visa"].includes(intent)) {
      setTopic(context, intent);

      return q === "price_topic"
        ? priceAnswer(intent, lang)
        : generalIntentAnswer("booking", context, lang);
    }

    return answer({
      vi: "Bạn chọn một dịch vụ: Bà Nà, Cù Lao Chàm, Hội An, Huế, đón sân bay hoặc visa.",
      en: "Please choose one: Ba Na, Cham Island, Hoi An, Hue, airport transfer, or visa.",
      ru: "Выберите услугу: Бана Хиллс, Чамские острова, Хойан, Хюэ, трансфер или виза.",
    }[lang], q, data);
  }

  if (q === "hoian_style") {
    if (includesAny(text, ["rừng dừa", "coconut", "кокос"])) {
      return answer(T.askGuests[lang], "guest_count", {
        topic: "hoian",
        pricingFlow: true,
      });
    }

    return answer(T.askDate[lang], "travel_date", {
      topic: "hoian",
      bookingFlow: true,
    });
  }

  if (q === "tour_details") {
    enrichContext(text, context);

    if (!context.guestCount) {
      return answer(T.askGuests[lang], "guest_count", {
        ...data,
        bookingFlow: true,
      });
    }

    if (!context.travelDate) {
      return answer(T.askDate[lang], "travel_date", {
        ...data,
        bookingFlow: true,
      });
    }

    return buildLeadAnswer(context, lang);
  }

  if (q === "combo_profile") {
    return answer({
      vi: "Cảm ơn bạn 🌿 Hãy chọn Combo 1, 2, 3 hoặc 4. Bạn cũng có thể nói sở thích như: biển, văn hóa, gia đình hoặc người lớn tuổi.",
      en: "Thank you 🌿 Please choose Combo 1, 2, 3, or 4. You can also tell me your preference: sea, culture, family, or seniors.",
      ru: "Спасибо 🌿 Выберите Комбо 1, 2, 3 или 4. Можно также указать предпочтения: море, культура, семья или пожилые гости."
    }[lang]);
  }

  if (["visa_details", "food_type", "phone_model", "hotel_or_area", "tour_interest"].includes(q)) {
    return answer({
      vi: "Cảm ơn bạn, tôi đã ghi nhận 🌿 Bạn có thể gửi thêm ngày đi, số người hoặc khu vực đang ở để tôi tư vấn chính xác hơn.",
      en: "Thank you, I’ve noted that 🌿 You can also send your date, group size, or current area so I can advise more accurately.",
      ru: "Спасибо, я записала 🌿 Можно также указать дату, количество человек и район проживания, чтобы совет был точнее.",
    }[lang]);
  }

  return null;
}

/* =========================================================
   LEAD ENGINE
========================================================= */

function calculateLeadScore(context, intent) {
  let score = context.bookingIntent || 0;

  if (context.activeTopic) score += 1;
  if (context.travelDate) score += 2;
  if (context.guestCount) score += 2;
  if (context.location) score += 1;
  if (context.hotel) score += 1;
  if (context.children) score += 1;

  if (intent === "price") score += 2;
  if (intent === "booking") score += 4;

  context.leadScore = score;
  context.leadStage =
    score >= 7 ? "hot" :
    score >= 4 ? "warm" :
    "cold";
}

function localizedTopic(topic, lang) {
  const names = {
    bana: { vi: "Bà Nà Hills", en: "Ba Na Hills", ru: "Бана Хиллс" },
    cham: { vi: "Cù Lao Chàm", en: "Cham Island", ru: "Чамские острова" },
    hoian: { vi: "Hội An", en: "Hoi An", ru: "Хойан" },
    hue: { vi: "Huế", en: "Hue", ru: "Хюэ" },
    airport: { vi: "Đón sân bay", en: "Airport transfer", ru: "Трансфер" },
    visa: { vi: "Visa", en: "Visa", ru: "Виза" },
  };

  return names[topic]?.[lang] || topic || "GoVietStay";
}

function buildLeadAnswer(context, lang) {
  context.handoffOffered = true;
  context.bookingIntent += 2;

  const lines = {
    vi: [
      "🌿 Tôi đã tổng hợp yêu cầu của bạn:",
      `• Dịch vụ: ${localizedTopic(context.activeTopic, lang)}`,
      context.travelDate ? `• Ngày: ${context.travelDate}` : null,
      context.guestCount ? `• Số khách: ${context.guestCount}` : null,
      context.location ? `• Khu vực: ${locationName(context.location, lang)}` : null,
      context.hotel ? `• Khách sạn: ${context.hotel}` : null,
      context.childAges.length ? `• Trẻ em: ${context.childAges.join(", ")} tuổi` : null,
      "",
      T.hotLead.vi,
    ],
    en: [
      "🌿 I’ve summarized your request:",
      `• Service: ${localizedTopic(context.activeTopic, lang)}`,
      context.travelDate ? `• Date: ${context.travelDate}` : null,
      context.guestCount ? `• Guests: ${context.guestCount}` : null,
      context.location ? `• Area: ${locationName(context.location, lang)}` : null,
      context.hotel ? `• Hotel: ${context.hotel}` : null,
      context.childAges.length ? `• Children: ${context.childAges.join(", ")} years old` : null,
      "",
      T.hotLead.en,
    ],
    ru: [
      "🌿 Я собрала ваш запрос:",
      `• Услуга: ${localizedTopic(context.activeTopic, lang)}`,
      context.travelDate ? `• Дата: ${context.travelDate}` : null,
      context.guestCount ? `• Гостей: ${context.guestCount}` : null,
      context.location ? `• Район: ${locationName(context.location, lang)}` : null,
      context.hotel ? `• Отель: ${context.hotel}` : null,
      context.childAges.length ? `• Дети: ${context.childAges.join(", ")} лет` : null,
      "",
      T.hotLead.ru,
    ],
  };

  return answer(
    lines[lang].filter(Boolean).join("\n"),
    null,
    {},
    true
  );
}

/* =========================================================
   CONTEXT MANAGEMENT
========================================================= */

function applyAnswer(context, result) {
  if (result.question) {
    setPending(context, result.question, result.data || {});
  } else {
    clearPending(context);
    openConversation(context);
  }
}

function shouldInterruptPending(intent, text, context) {
  if (!context.pendingQuestion || !intent) return false;

  if (["price", "booking", "medicine"].includes(intent)) return true;

  const oldTopic = context.pendingData?.topic || context.activeTopic;

  if (
    ["bana", "cham", "hoian", "hue", "airport", "visa"].includes(intent) &&
    intent !== oldTopic
  ) {
    return true;
  }

  return false;
}

function fallback(context, lang) {
  if (context.activeTopic) {
    return answer({
      vi: `Chúng ta đang nói về ${localizedTopic(context.activeTopic, lang)} 🌿 Bạn nói rõ hơn một câu nhé.`,
      en: `We were discussing ${localizedTopic(context.activeTopic, lang)} 🌿 Please explain in one short sentence.`,
      ru: `Мы говорили про ${localizedTopic(context.activeTopic, lang)} 🌿 Напишите чуть подробнее одним предложением.`,
    }[lang]);
  }

  return answer(T.notUnderstood[lang]);
}

/* =========================================================
   CALLBACK QUERY
========================================================= */

async function handleCallbackQuery(callbackQuery) {
  const message = callbackQuery.message;
  if (!message) return;

  const chatId = message.chat.id;
  const fakeMessage = {
    ...message,
    from: callbackQuery.from,
    text: callbackQuery.data || "",
  };
  const context = getContext(fakeMessage);
  const lang = context.language || telegramLanguage(callbackQuery.from?.language_code) || DEFAULT_LANGUAGE;
  context.language = lang;
  openConversation(context);

  const data = callbackQuery.data || "";
  let text = menuText(lang);
  let replyMarkup = mainMenuButtons(lang, context);

  if (data === "menu:tours") {
    text = toursMenuText(lang);
  } else if (data === "menu:combos") {
    text = comboMenuText(lang);
  } else if (data.startsWith("topic:")) {
    const topic = data.split(":")[1];
    if (["bana", "cham", "hoian", "hue", "airport", "visa"].includes(topic)) {
      setTopic(context, topic);
      const result = topicAnswer(topic, context, lang);
      applyAnswer(context, result);
      text = result.text;
      replyMarkup = mainMenuButtons(lang, context);
    }
  }

  saveContext(fakeMessage, context);
  await answerCallbackQuery(callbackQuery.id);
  await sendMessage(chatId, text, { reply_markup: replyMarkup });
}

/* =========================================================
   WEBHOOK
========================================================= */

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      bot: "Dao Brain V7 Full",
      brand: "GoVietStay",
      languages: ["vi", "en", "ru"],
      menu_command: true,
      callback_menu: true,
      auto_pin_menu: true,
      language_detection: true,
      price_book: true,
      combo_book: true,
      combos: 4,
      memory_hours: 6,
      ai_api_cost: 0,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const update = req.body || {};

    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
      return res.status(200).json({ ok: true, action: "callback_query" });
    }

    const message = update.message;
    if (!message || message.from?.is_bot) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;

    if (Array.isArray(message.new_chat_members) && message.new_chat_members.length) {
      const joined = message.new_chat_members.filter((m) => !m.is_bot);
      if (joined.length) {
        const lang = telegramLanguage(joined[0]?.language_code) || DEFAULT_LANGUAGE;
        await sendMessage(chatId, menuText(lang), {
          reply_markup: mainMenuButtons(lang),
          reply_to_message_id: message.message_id,
          allow_sending_without_reply: true,
        });
      }
      return res.status(200).json({ ok: true, action: "welcome_new_member" });
    }

    const rawText = message.text || "";
    if (!rawText) return res.status(200).json({ ok: true });

    const text = normalize(rawText);
    const firstName = message.from?.first_name || "friend";
    const context = getContext(message);
    const lang = detectLanguage(rawText, context, message.from?.language_code);
    const explicitLanguageSwitch = detectExplicitLanguageSwitch(rawText);

    context.language = lang;
    enrichContext(text, context);

    if (explicitLanguageSwitch) {
      const switchedText = {
        vi: "Được rồi 🌿 Từ bây giờ tôi sẽ trả lời bằng tiếng Việt.",
        en: "Of course 🌿 I’ll reply in English from now on.",
        ru: "Конечно 🌿 Теперь я буду отвечать по-русски.",
      };
      clearPending(context);
      openConversation(context);
      saveContext(message, context);
      await sendMessage(chatId, switchedText[lang], {
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true,
      });
      return res.status(200).json({ ok: true, action: "language_switched", language: lang });
    }

    if (text === "/start" || text.startsWith("/start@")) {
      clearPending(context);
      openConversation(context);
      saveContext(message, context);
      const privateChat = message.chat?.type === "private";
      await sendMessage(chatId, privateChat ? T.welcome[lang](firstName) : menuText(lang), {
        reply_markup: privateChat ? buttons(lang, context) : mainMenuButtons(lang, context),
      });
      return res.status(200).json({ ok: true, action: "start_v7", language: lang });
    }

    if (text === "/menu" || text.startsWith("/menu@")) {
      clearPending(context);
      openConversation(context);
      saveContext(message, context);
      await sendMessage(chatId, menuText(lang), {
        reply_markup: mainMenuButtons(lang, context),
      });
      return res.status(200).json({ ok: true, action: "menu_v7", language: lang });
    }

    if (text === "/pinmenu" || text.startsWith("/pinmenu@")) {
      clearPending(context);
      openConversation(context);
      saveContext(message, context);
      const sent = await sendMessage(chatId, menuText(lang), {
        reply_markup: mainMenuButtons(lang, context),
      });
      let pinned = false;
      if (sent.ok && sent.result?.message_id) {
        const pinResult = await pinMessage(chatId, sent.result.message_id);
        pinned = Boolean(pinResult.ok);
      }
      const status = pinned
        ? { vi: "📌 Đã tạo và ghim menu GoVietStay.", en: "📌 GoVietStay menu created and pinned.", ru: "📌 Меню GoVietStay создано и закреплено." }[lang]
        : { vi: "Menu đã được tạo nhưng chưa ghim được. Hãy cấp quyền Pin Messages cho bot.", en: "The menu was created but could not be pinned. Give the bot Pin Messages permission.", ru: "Меню создано, но не закреплено. Дайте боту право закреплять сообщения." }[lang];
      await sendMessage(chatId, status);
      return res.status(200).json({ ok: true, action: "pinmenu_v7", pinned });
    }

    if (text === "/pin" || text.startsWith("/pin@")) {
      const reply = message.reply_to_message;
      if (!reply) {
        await sendMessage(chatId, {
          vi: "Hãy trả lời tin nhắn cần ghim bằng lệnh /pin.",
          en: "Reply to the message you want to pin with /pin.",
          ru: "Ответьте командой /pin на сообщение, которое нужно закрепить.",
        }[lang]);
        return res.status(200).json({ ok: true });
      }
      const pinResult = await pinMessage(chatId, reply.message_id);
      await sendMessage(chatId, pinResult.ok
        ? { vi: "📌 Đào đã ghim tin nhắn.", en: "📌 Đào pinned the message.", ru: "📌 Дао закрепила сообщение." }[lang]
        : { vi: "Không thể ghim. Hãy kiểm tra quyền quản trị của bot.", en: "Unable to pin. Please check the bot’s admin permissions.", ru: "Не удалось закрепить. Проверьте права администратора." }[lang]);
      return res.status(200).json({ ok: true });
    }

    const detectedCombo = detectCombo(text);
    let intent = detectIntent(text);
    if (detectedCombo) {
      context.activeCombo = detectedCombo;
      intent = includesAny(text, ["giá", "bao nhiêu", "price", "how much", "цена", "сколько стоит", "стоимость"])
        ? "price" : "combo";
    }

    if (!shouldReply(message, text, intent, context)) {
      saveContext(message, context);
      return res.status(200).json({ ok: true, action: "silent", language: lang });
    }

    await sendTyping(chatId);
    if (shouldInterruptPending(intent, text, context)) clearPending(context);

    let result = null;
    let action = "fallback";
    if (context.pendingQuestion) {
      result = handlePending(text, context, lang);
      if (result) action = "pending_followup";
    }
    if (!result && intent) {
      context.lastIntent = intent;
      if (["bana", "cham", "hoian", "hue", "airport", "visa"].includes(intent)) setTopic(context, intent);
      result = generalIntentAnswer(intent, context, lang);
      action = `intent_${intent}`;
    }
    if (!result) result = fallback(context, lang);

    calculateLeadScore(context, intent);
    applyAnswer(context, result);
    saveContext(message, context);

    await sendMessage(chatId, result.text, {
      reply_to_message_id: message.message_id,
      allow_sending_without_reply: true,
      reply_markup: result.showButtons ? mainMenuButtons(lang, context) : undefined,
    });

    return res.status(200).json({
      ok: true,
      bot: "Dao Brain V7 Full",
      action,
      language: lang,
      intent: intent || "fallback",
      context: {
        activeTopic: context.activeTopic,
        activeCombo: context.activeCombo,
        pendingQuestion: context.pendingQuestion,
        guestCount: context.guestCount,
        travelDate: context.travelDate,
        location: context.location,
        leadScore: context.leadScore,
        leadStage: context.leadStage,
      },
    });
  } catch (error) {
    console.error("Dao Brain V7 webhook error:", error);
    return res.status(200).json({ ok: false, error: "Webhook processing error" });
  }
}
