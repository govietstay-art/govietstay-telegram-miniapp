const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const MINI_APP_URL = "https://project-e3jce.vercel.app";
const WHATSAPP_URL = "https://wa.me/84937762607";
const BOT_USERNAME = "govietstay_travel_bot";

const CONTEXT_TTL = 15 * 60 * 1000;

const conversations =
  globalThis.__DAO_V3_CONVERSATIONS__ || new Map();

globalThis.__DAO_V3_CONVERSATIONS__ = conversations;

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

function contextKey(message) {
  return `${message.chat.id}:${message.from?.id || "unknown"}`;
}

function createContext() {
  return {
    lastIntent: null,
    location: null,
    children: false,
    childAges: [],
    pendingQuestion: null,
    pendingData: {},
    conversationOpenUntil: 0,
    updatedAt: Date.now(),
  };
}

function getContext(message) {
  const key = contextKey(message);
  const saved = conversations.get(key);

  if (!saved) {
    return createContext();
  }

  if (Date.now() - saved.updatedAt > CONTEXT_TTL) {
    conversations.delete(key);
    return createContext();
  }

  return saved;
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

function setPendingQuestion(context, question, data = {}) {
  context.pendingQuestion = question;
  context.pendingData = data;
  openConversation(context);
}

function clearPendingQuestion(context) {
  context.pendingQuestion = null;
  context.pendingData = {};
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

function locationName(location) {
  if (location === "danang") return "Дананг";
  if (location === "hoian") return "Хойан";
  if (location === "hue") return "Хюэ";
  return null;
}

function extractAges(text) {
  const numbers = text.match(/\b([1-9]|1[0-7])\b/g);

  if (!numbers) {
    return [];
  }

  return numbers.map(Number);
}

function isYes(text) {
  return includesAny(text, [
    "да",
    "может",
    "может сам",
    "самостоятельно",
    "сама",
    "сам",
    "yes",
  ]);
}

function isNo(text) {
  return includesAny(text, [
    "нет",
    "не может",
    "не может сам",
    "не может сама",
    "нужна помощь",
    "нужна поддержка",
    "no",
  ]);
}

function detectIntent(text) {
  const intents = [
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
      id: "russian_guide",
      words: [
        "русский гид",
        "русскоговорящий гид",
        "гид на русском",
        "русская поддержка",
      ],
    },
    {
      id: "elderly",
      words: [
        "мама плохо ходит",
        "папа плохо ходит",
        "плохо ходит",
        "трудно ходить",
        "пожилой",
        "пожилая",
        "пожилые",
        "инвалид",
        "коляска",
        "ограниченная подвижность",
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
      id: "cham",
      words: [
        "чам",
        "чамские",
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
      ],
    },
    {
      id: "weather",
      words: [
        "погода",
        "дождь",
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

function wasReplyToDao(message) {
  return (
    message.reply_to_message?.from?.username === BOT_USERNAME
  );
}

function shouldReply(message, text, intent, context) {
  if (message.chat?.type === "private") {
    return true;
  }

  const normalized = normalize(text);

  const calledDao = includesAny(normalized, [
    "дао",
    "dao",
    `@${BOT_USERNAME}`,
  ]);

  if (calledDao || wasReplyToDao(message)) {
    return true;
  }

  if (
    context.pendingQuestion &&
    isConversationOpen(context)
  ) {
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

function createAnswer(text, question = null, data = {}) {
  return {
    text,
    question,
    data,
  };
}

function answerCham(context) {
  if (context.children) {
    return createAnswer(
      `С детьми на Чамские острова ехать можно 🌿

Но я бы сначала посмотрела возраст детей и состояние моря в день поездки.

Поездка проходит на скоростном катере, поэтому для маленьких детей спокойное море особенно важно.

Сколько лет детям?`,
      "child_ages",
      {
        topic: "cham",
      }
    );
  }

  return createAnswer(
    random([
      `Чамские острова мне очень нравятся 🌿

Но здесь есть один важный момент — море.

Даже если утром в Дананге солнечно, выход скоростных катеров зависит от состояния моря и решения порта.

Если море спокойное, поездка обычно очень приятная: катер, остров, снорклинг и отдых.

Вы планируете поездку с детьми или только взрослые?`,

      `Если вы впервые в Центральном Вьетнаме, Чамские острова стоит рассмотреть 🏝

Я бы только не планировала поездку совсем без запаса по датам. Иногда море заставляет менять планы.

Вы едете с детьми или только взрослые?`,
    ]),
    "travel_party",
    {
      topic: "cham",
    }
  );
}

function answerChildren(context) {
  return createAnswer(
    `С детьми я бы не пыталась делать слишком много точек за один день 😊

Лучше меньше мест, но без спешки и усталости.

Сколько лет детям?`,
    "child_ages",
    {
      topic: context.lastIntent || "general",
    }
  );
}

function answerElderly() {
  return createAnswer(
    `Тогда я бы не советовала маршрут с большим количеством точек 🌿

Лучше сделать поездку медленнее: короткие прогулки, время для отдыха и машина рядом.

Маршрут должен подходить человеку, а не человек маршруту.

Скажите, пожалуйста, человек может самостоятельно садиться в автомобиль?`,
    "mobility_car",
    {
      topic: "mobility",
    }
  );
}

function answerAirport() {
  return createAnswer(
    `Из аэропорта Дананга проще всего заранее организовать машину 🚗

Особенно если вы прилетаете вечером, с детьми или с большим багажом.

Куда вам нужно ехать — в Дананг или Хойан?`,
    "location"
  );
}

function answerSim() {
  return createAnswer(
    `Для туриста SIM или eSIM действительно полезна 📶

Главное — чтобы интернет нормально работал для карт, Telegram и WhatsApp.

Какая у вас модель телефона?`,
    "phone_model"
  );
}

function answerMoney() {
  return createAnswer(
    `Я бы не меняла большую сумму сразу в аэропорту 💱

Небольшой суммы на первые расходы достаточно, а основную часть лучше менять позже в проверенном месте.

Вы сейчас в Дананге или Хойане?`,
    "location"
  );
}

function answerFood(context) {
  const location = locationName(context.location);

  return createAnswer(
    `${location ? `Поняла, вы в ${location} 🌿\n\n` : ""}Я бы сначала уточнила, что именно вам хочется 🍜

Местная кухня, морепродукты или спокойный ресторан для семьи?`,
    "food_type"
  );
}

function answerDanangOrHoiAn() {
  return createAnswer(
    `Если любите море, кафе и более активную жизнь — я бы выбрала Дананг 😊

Если хочется старых улиц, фонарей и спокойной вечерней атмосферы — Хойан 🏮

Для первой поездки многие живут в Дананге и ездят в Хойан вечером.

Вы путешествуете один, парой или с семьёй?`,
    "travel_party"
  );
}

function answerBana() {
  return createAnswer(
    `Бана Хиллс стоит посетить хотя бы ради Золотого моста и горной атмосферы 🌉

Но я советую ехать утром. Позже обычно становится больше людей.

Сколько человек у вас?`,
    "guest_count"
  );
}

function answerHoiAn() {
  return createAnswer(
    `Хойан особенно красив ближе к вечеру 🏮

Я бы приехала до заката, спокойно погуляла, а потом осталась посмотреть фонари и реку.

Вы хотите просто прогулку или Хойан вместе с кокосовым лесом?`,
    "hoian_style"
  );
}

function answerHue() {
  return createAnswer(
    `Хюэ — это больше история и культура 🏯

Я бы выделила на него целый день и не пыталась добавить слишком много других мест.

Вы любите историю или просто хотите увидеть самые красивые места?`,
    "hue_style"
  );
}

function answerRussianGuide() {
  return createAnswer(
    `Да, русскоязычная поддержка возможна 🇷🇺🌿

Напишите, пожалуйста, дату поездки и количество человек.

Я помогу передать информацию команде GoVietStay.`,
    "guide_details"
  );
}

function answerWeather() {
  return createAnswer(
    `С погодой и морем я не хочу угадывать 🌿

Для морских поездок важен не только дождь. Даже при солнце состояние моря может быть небезопасным.

О какой дате поездки вы спрашиваете?`,
    "travel_date"
  );
}

function answerMedicine() {
  return createAnswer(
    `Если человеку действительно плохо, лучше не пытаться ставить диагноз по переписке.

Напишите, пожалуйста, что именно случилось и в каком районе вы сейчас находитесь.

Если ситуация срочная или состояние быстро ухудшается — нужно обратиться за медицинской помощью сразу.`,
    "medical_details"
  );
}

function answerTour() {
  return createAnswer(
    `Конечно 🌿

Сначала мне нужно понять самих путешественников, а не просто выбрать готовый тур.

Напишите дату, количество человек и где вы живёте — Дананг или Хойан.`,
    "tour_details"
  );
}

function buildIntentAnswer(intent, context) {
  switch (intent) {
    case "cham":
      return answerCham(context);
    case "children":
      return answerChildren(context);
    case "elderly":
      return answerElderly();
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

function handlePendingAnswer(text, context) {
  const question = context.pendingQuestion;

  if (!question) {
    return null;
  }

  if (question === "child_ages") {
    const ages = extractAges(text);

    if (!ages.length) {
      return createAnswer(
        `Кажется, я немного не поняла 😊

Вы имеете в виду возраст детей?

Например: 4 и 8 лет.`,
        "child_ages",
        context.pendingData
      );
    }

    context.children = true;
    context.childAges = ages;

    const youngest = Math.min(...ages);

    if (context.pendingData?.topic === "cham") {
      if (youngest <= 5) {
        return createAnswer(
          `Поняла 🌿 Детям ${ages.join(" и ")} лет.

С ребёнком ${youngest} лет я бы особенно внимательно смотрела состояние моря в день поездки.

Я не говорю, что ехать нельзя. Просто комфорт маленького ребёнка на скоростном катере для меня важнее количества мест в программе.

Вы сейчас живёте в Дананге или Хойане?`,
          "location",
          {
            topic: "cham",
          }
        );
      }

      return createAnswer(
        `Поняла 😊 Детям ${ages.join(" и ")} лет.

Для такого возраста поездка обычно проще.

Но состояние моря всё равно нужно учитывать ближе к дате.

Вы сейчас в Дананге или Хойане?`,
        "location",
        {
          topic: "cham",
        }
      );
    }

    return createAnswer(
      `Поняла 😊 Детям ${ages.join(" и ")} лет.

Тогда маршрут уже можно подбирать намного точнее.

Я бы всё равно не делала слишком много остановок за один день.

Вы сейчас живёте в Дананге или Хойане?`,
      "location"
    );
  }

  if (question === "mobility_car") {
    if (isYes(text)) {
      return createAnswer(
        `Хорошо, это уже многое упрощает 🌿

Тогда можно сделать спокойный маршрут с машиной рядом, короткими прогулками и достаточным временем для отдыха.

Куда вы хотели бы поехать?`
      );
    }

    if (isNo(text)) {
      return createAnswer(
        `Поняла 🌿

Тогда маршрут нужно планировать ещё внимательнее.

Я бы заранее учитывала посадку в автомобиль, расстояние до входов и минимальное количество лестниц.

Напишите, пожалуйста, куда вы хотели бы поехать.`
      );
    }

    const ages = extractAges(text);

    if (ages.length) {
      return createAnswer(
        `Кажется, мы немного смешали два вопроса 😊

${ages.join(" и ")} — это возраст детей?

А про маму я спрашивала: она может самостоятельно садиться в автомобиль?`,
        "mobility_car",
        {
          possibleChildAges: ages,
        }
      );
    }

    return createAnswer(
      `Кажется, я не совсем поняла 😊

Я спрашивала, может ли человек самостоятельно садиться в автомобиль.

Можно просто ответить: да или нет.`,
      "mobility_car"
    );
  }

  if (question === "location") {
    const location = detectLocation(text);

    if (!location) {
      return createAnswer(
        `Уточню совсем коротко 😊

Вы сейчас в Дананге или Хойане?`,
        "location",
        context.pendingData
      );
    }

    context.location = location;

    return createAnswer(
      `Поняла, ${locationName(location)} 🌿

Спасибо. Теперь мне проще советовать по месту.

Что для вас сейчас важнее всего — поездка, еда, трансфер или просто совет по городу?`
    );
  }

  if (question === "travel_party") {
    if (includesAny(text, ["дет", "ребен", "ребён"])) {
      context.children = true;

      return createAnswer(
        `Поняла, вы путешествуете с детьми 🌿

Тогда мне важен возраст детей.

Сколько им лет?`,
        "child_ages",
        context.pendingData
      );
    }

    return createAnswer(
      `Поняла 🌿

Тогда я бы подбирала маршрут именно под ваш темп, а не пыталась показать всё за один день.

Что вам интереснее — море, природа, история или местная жизнь?`
    );
  }

  return null;
}

function applyAnswerContext(context, answer) {
  if (!answer) {
    return;
  }

  if (answer.question) {
    setPendingQuestion(
      context,
      answer.question,
      answer.data || {}
    );
  } else {
    clearPendingQuestion(context);
    openConversation(context);
  }
}

function welcomeMessage(firstName) {
  return `🌿 Здравствуйте, ${firstName}!

Я Дао — местный помощник GoVietStay во Вьетнаме 🇻🇳

Я в первую очередь помогаю русскоязычным путешественникам в Дананге, Хойане, Хюэ и Центральном Вьетнаме.

Можно спросить меня о Чамских островах, поездках, трансфере, SIM, местной еде или путешествии с детьми и пожилыми родителями.

Я не буду сразу продавать экскурсию 😊

Сначала постараюсь понять вашу ситуацию и помочь.

Просто напишите свой вопрос 🌿`;
}

function smartFallback(context) {
  if (isConversationOpen(context)) {
    return createAnswer(
      `Кажется, я немного потеряла смысл вашего ответа 😊

Не хочу придумывать.

Скажите чуть подробнее одним предложением — я попробую понять вас правильно.`
    );
  }

  return createAnswer(
    random([
      `Я Дао 🌿

Лучше всего я знаю Дананг, Хойан, Хюэ и путешествия по Центральному Вьетнаму.

Что именно вы хотите узнать?`,

      `Постараюсь помочь 🌿

Скажите немного подробнее: где вы сейчас и что планируете?`,
    ])
  );
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      bot: "Dao V3",
      brand: "GoVietStay",
      language: "Russian first",
      brain: "Conversation context",
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

    if (!text) {
      return res.status(200).json({ ok: true });
    }

    const normalizedText = normalize(text);
    const firstName = message.from?.first_name || "друг";

    if (
      normalizedText === "/start" ||
      normalizedText.startsWith("/start@")
    ) {
      await sendMessage(
        chatId,
        welcomeMessage(firstName),
        {
          reply_markup: buttons(),
        }
      );

      return res.status(200).json({
        ok: true,
        action: "welcome",
      });
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

      const pinResult = await pinMessage(
        chatId,
        reply.message_id
      );

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

    const pendingAnswer = handlePendingAnswer(
      normalizedText,
      context
    );

    if (pendingAnswer) {
      await sendTyping(chatId);

      applyAnswerContext(context, pendingAnswer);
      saveContext(message, context);

      await sendMessage(chatId, pendingAnswer.text, {
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true,
      });

      return res.status(200).json({
        ok: true,
        action: "conversation_follow_up",
        pending_question: context.pendingQuestion,
      });
    }

    const intent = detectIntent(normalizedText);

    if (
      !shouldReply(
        message,
        text,
        intent,
        context
      )
    ) {
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

      const answer = buildIntentAnswer(
        intent,
        context
      );

      applyAnswerContext(context, answer);
      saveContext(message, context);

      await sendMessage(chatId, answer.text, {
        reply_to_message_id: message.message_id,
        allow_sending_without_reply: true,
        reply_markup:
          intent === "tour" ||
          intent === "russian_guide"
            ? buttons()
            : undefined,
      });

      return res.status(200).json({
        ok: true,
        intent,
        pending_question:
          context.pendingQuestion,
      });
    }

    const fallback = smartFallback(context);

    applyAnswerContext(context, fallback);
    saveContext(message, context);

    await sendMessage(chatId, fallback.text, {
      reply_to_message_id: message.message_id,
      allow_sending_without_reply: true,
    });

    return res.status(200).json({
      ok: true,
      intent: "fallback",
    });
  } catch (error) {
    console.error(
      "Dao V3 webhook error:",
      error
    );

    return res.status(200).json({
      ok: false,
      error: "Webhook processing error",
    });
  }
}
