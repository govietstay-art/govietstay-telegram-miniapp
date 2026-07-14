const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req, res) {
  try {
    if (!BOT_TOKEN) {
      return res.status(500).json({
        ok: false,
        error: "Missing TELEGRAM_BOT_TOKEN",
      });
    }

    const webhookUrl =
      "https://project-e3jce.vercel.app/api/telegram";

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message"],
          drop_pending_updates: true,
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json({
      dao: "GoVietStay Russian Travel Assistant",
      webhook: webhookUrl,
      telegram: data,
    });
  } catch (error) {
    console.error("Setup webhook error:", error);

    return res.status(500).json({
      ok: false,
      error: "Webhook setup failed",
    });
  }
}
