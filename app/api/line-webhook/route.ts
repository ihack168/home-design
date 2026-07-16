const LINE_CHANNEL_ACCESS_TOKEN = "4D5Wvsgen2TjxIjoaQFLchjFRkv/OcCMN+2w+X3LLIKM+uld854mUrab3OpKB4ruwLhm7ijYmRK+5cGQg2MJxkAxK1RfBsLtTn3rXGVtpJtt/KCeP3hoGb7lQ9s6U5sc6Xlv/P0nOMbi58uRXi5gCQdB04t89/1O/w1cDnyilFU=";

export async function POST(req: Request) {
  const body = await req.text();

  try {
    const data = JSON.parse(body);
    const events = data.events || [];

    for (const event of events) {
      const userId = event?.source?.userId;
      const replyToken = event?.replyToken;

      console.log("LINE USER ID:", userId);

      if (userId && replyToken) {
        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            replyToken,
            messages: [
              {
                type: "text",
                text: `你的 LINE userId：\n${userId}`
              }
            ]
          })
        });
      }
    }
  } catch (err) {
    console.error("LINE webhook error:", err);
  }

  return new Response("ok", {
    status: 200
  });
}

export async function GET() {
  return new Response("ok", {
    status: 200
  });
}