const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const MINI_APP_URL = "https://project-e3jce.vercel.app";
const WHATSAPP_URL = "https://wa.me/84937762607";

const BOT_USERNAME = "govietstay_travel_bot";

/**
 * Short-lived in-memory conversation context.
 * This may reset between Vercel function instances.
 * Good enough for Dao V2 testing without a paid database.
 */
const conversations = globalThis.__DAO_CONVERSATIONS__ || new Map();
globalThis.__DAO_CONVERSATIONS__ = conversations;

async function telegram(method, body) {
  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[.,!;:()[\]{}"'«»]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function random(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function getContextKey(message) {
  return `${message.chat.id}:${message.from?.id || "unknown"}`;
}

function getContext(message) {
  return conversations.get(getContextKey(message)) || {
    lastIntent: null,
    location: null,
    adults: null,
    children: null,
    childAges: [],
    updatedAt: Date.now(),
  };
}

function saveContext(message, context) {
  context.updatedAt = Date.now();
  conversations.set(getContextKey(message), context);
}

function detectLocation(text) {
  if (includesAny(text, ["дананг", "da nang", "дананге"])) {
    return "danang";
  }

  if (includesAny(text, ["хойан", "hoi an", "хойане"])) {
    return "hoian";
  }

  if (includesAny(text, ["хуэ", "hue"])) {
    return "hue";
  }

  return null;
}

function detectIntent(text) {
  const intents = [
    {
      id: "cham",
      words: [
        "чам",
        "чамские",
        "острова",
        "cham island",
        "кулаочам",
        "ку лао чам",
        "снорклинг",
      ],
    },
    {
      id: "airport",
      words: [
        "аэропорт",
        "трансфер",
        "встретить",
        "встреча в аэропорту",
        "airport",
      ],
    },
    {
      id: "sim",
      words: [
        "sim",
        "esim",
        "сим",
        "интернет",
        "мобильный интернет",
        "связь",
      ],
    },
    {
      id: "money",
      words: [
        "обмен",
        "деньги",
        "доллар",
        "доллары",
        "валют",
        "курс",
        "поменять",
        "наличные",
      ],
    },
    {
      id: "food",
      words: [
        "поесть",
        "еда",
        "ресторан",
        "кафе",
        "кухня",
        "морепродукты",
        "вкусно",
        "food",
      ],
    },
    {
      id: "danang_or_hoian",
      words: [
        "дананг или хойан",
        "хойан или дананг",
        "где жить",
        "где остановиться",
        "лучше жить",
      ],
    },
    {
      id: "bana",
      words: [
        "бана",
        "ba na",
        "золотой мост",
        "golden bridge",
        "канатная дорога",
      ],
    },
    {
      id: "hoian",
      words: [
        "хойан",
        "hoi an",
        "фонари",
        "старый город",
        "лодка",
        "кокосовый лес",
      ],
    },
    {
      id: "hue",
      words: [
        "хуэ",
        "hue",
        "императорский город",
        "цитадель",
        "гробницы",
      ],
    },
    {
      id: "russian_guide",
      words: [
        "русский гид",
        "русскоговорящий гид",
        "гид на русском",
        "говорит по русски",
        "русская поддержка",
      ],
    },
    {
      id: "children",
      words: [
        "ребенок",
        "ребёнок",
        "дети",
        "ребенка",
        "ребёнка",
        "с детьми",
        "малыш",
      ],
    },
    {
      id: "elderly",
      words: [
        "пожилой",
        "пожилая",
        "пожилые",
        "мама плохо ходит",
        "папа плохо ходит",
        "трудно ходить",
        "инвалид",
        "коляска",
      ],
    },
    {
      id: "weather",
      words: [
        "погода",
        "дождь",
        "море",
        "волны",
        "шторм",
        "ветер",
        "отменили",
        "отмена",
      ],
    },
    {
      id: "medicine",
      words: [
        "аптека",
        "лекарство",
        "заболел",
        "заболела",
        "болит",
        "врач",
        "больница",
        "температура",
      ],
    },
    {
      id: "tour",
      words: [
        "тур",
        "экскурсия",
        "маршрут",
        "поездка",
        "хотим поехать",
        "организовать",
        "цена тура",
      ],
    },
  ];

  for (const intent of intents) {
    if (includesAny(text, intent.words)) {
      return intent.id;
    }
  }

  return null;
}

function isQuestion(text) {
  return (
    text.includes("?") ||
    includesAny(text, [
      "где ",
      "как ",
      "куда ",
      "можно ",
      "стоит ",
      "посоветуйте",
      "подскажите",
      "сколько ",
      "что лучше",
      "кто знает",
    ])
  );
}

function shouldReply(message, text, intent) {
  const chatType = message.chat?.type;

  if (chatType === "private") {
    return true;
  }

  const normalized = normalize(text);

  const calledDao = includesAny(normalized, [
    "дао",
    "dao",
    `@${BOT_USERNAME}`,
  ]);

  const repliedToDao =
    message.reply_to_message?.from?.username === BOT_USERNAME;

  if (calledDao || repliedToDao) {
    return true;
  }

  if (intent && isQuestion(normalized)) {
    return true;
  }

  return false;
}

function buttons() {
  return {
    inline_keyboard: [
      [
        {
          text: "🌿 Explore Vietnam",
          web_app: {
            url: MINI_APP_URL,
          },
        },
      ],
      [
        {
          text: "💬 GoVietStay WhatsApp",
          url: WHATSAPP_URL,
        },
      ],
    ],
  };
}

function answerCham(context) {
  if (context.children) {
    return `С детьми на Чамские острова ехать можно 🌿

Но я бы сначала посмотрела возраст детей и состояние моря в день поездки.

Поездка проходит на скоростном катере, поэтому для маленьких детей спокойное море особенно важно.

Сколько лет детям?`;
  }

  return random([
    `Чамские острова мне очень нравятся 🌿

Но здесь есть один важный момент: море.

Даже если утром в Дананге солнечно, выход скоростных катеров зависит от состояния моря и решения порта.

Если море спокойное — поездка обычно очень приятная: катер, остров, снорклинг и отдых.

Вы планируете поездку с детьми или только взрослые?`,

    `Если вы впервые в Центральном Вьетнаме, Чамские острова стоит рассмотреть 🏝

Я бы только не планировала их совсем без запаса по датам. Иногда поездку приходится переносить из-за моря.

Вы сейчас живёте в Дананге или Хойане?`,
  ]);
}

function answerAirport() {
  return random([
    `Из аэропорта Дананга проще всего заранее организовать машину 🚗

Особенно если вы прилетаете вечером, с детьми или с большим багажом.

Напишите, пожалуйста, в какой отель вы едете?`,

    `Если речь об аэропорте Дананга, я бы не усложняла 😊

Для семьи или нескольких человек удобнее заранее знать машину и место встречи.

Куда вам нужно ехать — Дананг или Хойан?`,
  ]);
}

function answerSim() {
  return `Для туриста SIM или eSIM действительно полезна 📶

Главное — чтобы интернет нормально работал для карт, Telegram и WhatsApp.

Если скажете модель телефона и сколько дней вы будете во Вьетнаме, я подскажу, что удобнее: SIM или eSIM.`;
}

function answerMoney() {
  return random([
    `Я бы не меняла большую сумму сразу в аэропорту 💱

Небольшой суммы на первые расходы достаточно, а основную часть лучше менять позже в проверенном месте.

Вы сейчас в Дананге или Хойане?`,

    `С обменом денег во Вьетнаме лучше не спешить 🌿

Сначала сравните курс и обязательно пересчитайте деньги на месте.

Где вы сейчас находитесь — Дананг или Хойан?`,
  ]);
}

function answerFood(context) {
  if (context.location === "hoian") {
    return `В Хойане выбор зависит от того, что вам хочется 😊

Если местная кухня — можно искать блюда Центрального Вьетнама.

Если хочется атмосферы — я бы выбрала место ближе к старому городу, но не обязательно прямо на самой туристической улице.

Вы хотите местную еду или морепродукты?`;
  }

  return `В Дананге я бы сначала уточнила район и что именно вы хотите 🍜

Местная еда, морепродукты или спокойный ресторан для семьи?

Скажите одно — и я постараюсь сузить выбор.`;
}

function answerDanangOrHoiAn() {
  return `Если любите море, кафе и более активную жизнь — я бы выбрала Дананг 😊

Если хочется старых улиц, фонарей и более спокойной вечерней атмосферы — Хойан 🏮

Для первой поездки многие живут в Дананге и ездят в Хойан вечером.

Вы путешествуете один, парой или с семьёй?`;
}

function answerBana() {
  return `Бана Хиллс стоит посетить хотя бы ради Золотого моста и горной атмосферы 🌉

Но я советую ехать утром. Позже обычно становится больше людей.

Если в группе есть пожилые люди или маленькие дети, маршрут лучше делать спокойнее.

Сколько человек у вас?`;
}

function answerHoiAn() {
  return `Хойан особенно красив ближе к вечеру 🏮

Я бы приехала до заката, спокойно погуляла, а потом осталась посмотреть фонари и реку.

Не обязательно пытаться увидеть всё сразу.

Вы хотите просто прогулку или Хойан вместе с кокосовым лесом?`;
}

function answerHue() {
  return `Хюэ — это уже больше история и культура 🏯

Я бы выделила на него целый день и не пыталась добавить слишком много других мест.

Если ехать из Дананга, маршрут можно сделать через перевал Хай Ван.

Вы любите историю или просто хотите увидеть самые красивые места?`;
}

function answerRussianGuide() {
  return `Да, русскоязычная поддержка возможна 🇷🇺🌿

Напишите, пожалуйста, дату поездки, количество человек и куда вы хотите поехать.

Я помогу передать информацию команде GoVietStay.`;
}

function answerChildren(context) {
  if (context.lastIntent === "cham") {
    context.children = true;

    return `Поняла 🌿 Тогда для Чамских островов мне важен возраст детей.

Поездка проходит на скоростном катере, и с маленькими детьми я всегда советую внимательнее смотреть состояние моря.

Сколько лет детям?`;
  }

  return `С детьми я бы не пыталась делать слишком много точек за один день 😊

Лучше меньше мест, но без спешки и усталости.

Сколько лет детям?`;
}

function answerElderly() {
  return `Тогда я бы не советовала маршрут с большим количеством точек 🌿

Лучше сделать поездку медленнее: короткие прогулки, время для отдыха и машина рядом.

Маршрут должен подходить человеку, а не человек маршруту.

Скажите, пожалуйста, человек может самостоятельно садиться в автомобиль?`;
}

function answerWeather() {
  return `С погодой и морем я не хочу угадывать 🌿

Для морских поездок важен не только дождь. Даже при солнце состояние моря может быть небезопасным.

Окончательное решение по выходу катеров зависит от реальных морских условий и разрешения порта.

О какой дате поездки вы спрашиваете?`;
}

function answerMedicine() {
  return `Если человеку действительно плохо, лучше не пытаться ставить диагноз по переписке.

Напишите, пожалуйста, что именно случилось и в каком районе вы сейчас находитесь.

Если ситуация срочная или состояние быстро ухудшается — нужно обратиться за медицинской помощью сразу.`;
}

function answerTour() {
  return `Конечно 🌿

Сначала мне нужно понять самих путешественников, а не просто выбрать готовый тур.

Напишите, пожалуйста:

📅 дату
👥 количество человек
📍 где вы живёте — Дананг или Хойан

И я помогу понять, какой маршрут будет удобнее.`;
}

function buildIntentAnswer(intent, context) {
  switch (intent) {
    case "cham":
      return answerCham(context);

    case "airport":
      return answerAirport();

    case "sim":
      return answerSim();

    case "money":
      return answerMoney();

    case "food":
      return answerFood(context);

    case "danang_or_hoian":
      return answerDanangOrHoiAn();

    case "bana":
      return answerBana();

    case "hoian":
      return answerHoiAn();

    case "hue":
      return answerHue();

    case "russian_guide":
      return answerRussianGuide();

    case "children":
      return answerChildren(context);

    case "elderly":
      return answerElderly();

    case "weather":
      return answerWeather();

    case "medicine":
      return answerMedicine();

    case "tour":
      return answerTour();

    default:
      return null;
  }
}

function contextFollowUp(text, context) {
  const ageMatches = text.match(/\b([1-9]|1[0-7])\b/g);

  if (
    context.lastIntent === "children" ||
    (context.lastIntent === "cham" && context.children)
  ) {
    if (ageMatches?.length) {
      context.childAges = ageMatches.map(Number);
      context.children = true;

      const youngest = Math.min(...context.childAges);

      if (context.lastIntent === "cham") {
        if (youngest <= 5) {
          return `Поняла 🌿

С ребёнком ${youngest} лет я бы особенно внимательно смотрела состояние моря в день поездки.

Я не говорю, что ехать нельзя. Просто для маленького ребёнка комфорт на скоростном катере важнее количества мест в программе.

Вы сейчас живёте в Дананге или Хойане?`;
        }

        return `Поняла 😊 Для детей такого возраста поездка обычно проще.

Но море всё равно нужно проверять ближе к дате.

Вы сейчас в Дананге или Хойане?`;
      }
    }
  }

  return null;
}

function welcomeMessage(firstName) {
  return `🌿 Здравствуйте, ${firstName}!

Я Дао — местный помощник GoVietStay во Вьетнаме 🇻🇳

Я помогаю в первую очередь русскоязычным путешественникам в Дананге, Хойане, Хюэ и Центральном Вьетнаме.

Можно спросить меня о поездках, Чамских островах, трансфере, SIM, местной еде или просто жизни путешественника во Вьетнаме.

Я не буду сразу продавать вам экскурсию 😊

Сначала постараюсь помочь.

Просто напишите свой вопрос 🌿`;
}

function fallbackAnswer() {
  return random([
    `Я Дао 🌿

Я лучше всего знаю Дананг, Хойан, Хюэ и путешествия по Центральному Вьетнаму.

Скажите немного подробнее, что вы хотите узнать?`,

    `Постараюсь помочь 🌿

Можно чуть подробнее?

Например: где вы сейчас находитесь и что именно планируете?`,
  ]);
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      bot: "Dao V2",
      brand: "GoVietStay",
      language: "Russian first",
      ai_api_cost: 0,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const update = req.body;
    const message = update.message;

    if (!message || message.from?.is_bot) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text || "";
    const normalizedText = normalize(text);
    const firstName = message.from?.first_name || "друг";

    if (!text) {
      return res.status(200).json({ ok: true });
    }

    if (
      normalizedText === "/start" ||
      normalizedText.startsWith("/start@")
    ) {
      await sendMessage(chatId, welcomeMessage(firstName), {
        reply_markup: buttons(),
      });

      return res.status(200).json({ ok: true });
    }

    if (
      normalizedText === "/pin" ||
      normalizedText.startsWith("/pin@")
    ) {
      const reply = message.reply_to_message;

      if (!reply) {
        await sendMessage(
          chatId,
          "🌿 Дэвид, ответьте командой /pin на сообщение, которое нужно закрепить."
        );

        return res.status(200).json({ ok: true });
      }

      const pinResult = await pinMessage(chatId, reply.message_id);

      if (pinResult.ok) {
        await sendMessage(
          chatId,
          "📌 Сообщение закреплено Дао 🌿"
        );
      } else {
        await sendMessage(
          chatId,
          "Не удалось закрепить сообщение. Проверьте права администратора."
        );
      }

      return res.status(200).json({ ok: true });
    }

    const context = getContext(message);

    const location = detectLocation(normalizedText);

    if (location) {
      context.location = location;
    }

    const followUp = contextFollowUp(normalizedText, context);

    if (followUp) {
      await sendTyping(chatId);

      await sendMessage(chatId, followUp, {
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true,
      });

      saveContext(message, context);

      return res.status(200).json({ ok: true });
    }

    const intent = detectIntent(normalizedText);

    if (!shouldReply(message, text, intent)) {
      return res.status(200).json({
        ok: true,
        action: "silent",
      });
    }

    await sendTyping(chatId);

    if (intent) {
      context.lastIntent = intent;

      if (intent === "children") {
        context.children = true;
      }

      const answer = buildIntentAnswer(intent, context);

      await sendMessage(chatId, answer, {
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true,
        reply_markup:
          intent === "tour" || intent === "russian_guide"
            ? buttons()
            : undefined,
      });

      saveContext(message, context);

      return res.status(200).json({
        ok: true,
        intent,
      });
    }

    await sendMessage(chatId, fallbackAnswer(), {
      reply_to_message_id: message.message_id,
      allow_sending_without_reply: true,
    });

    saveContext(message, context);

    return res.status(200).json({
      ok: true,
      intent: "fallback",
    });
  } catch (error) {
    console.error("Dao V2 webhook error:", error);

    return res.status(200).json({
      ok: false,
      error: "Webhook processing error",
    });
  }
}
