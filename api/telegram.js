const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

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
    console.error("Telegram API error:", data);
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

async function pinMessage(chatId, messageId) {
  return telegram("pinChatMessage", {
    chat_id: chatId,
    message_id: messageId,
    disable_notification: true,
  });
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      bot: "Dao",
      brand: "GoVietStay",
      market: "Russian-speaking travelers",
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

    console.log("Telegram update:", JSON.stringify(update));

    const message = update.message;

    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text || "";
    const firstName = message.from?.first_name || "друг";

    if (text === "/start" || text.startsWith("/start@")) {
      await sendMessage(
        chatId,
        `🌿 Здравствуйте, ${firstName}!

Я Дао — местный помощник GoVietStay во Вьетнаме 🇻🇳

Я помогаю русскоязычным путешественникам в Дананге, Хойане и Центральном Вьетнаме.

Вы можете спросить меня о:

🏝 Чамских островах
🚗 трансфере из аэропорта
📶 SIM и интернете
💱 обмене денег
🍜 местной еде
🏯 Дананге, Хойане и Хюэ
🇷🇺 русскоязычной поддержке

Просто напишите свой вопрос.

Я постараюсь помочь вам 🌿`
      );

      return res.status(200).json({ ok: true });
    }

    if (
      text === "/pin" ||
      text.startsWith("/pin@")
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

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Dao webhook error:", error);

    return res.status(200).json({
      ok: false,
      error: "Webhook processing error",
    });
  }
}
