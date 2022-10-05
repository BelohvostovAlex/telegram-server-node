const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const token = "5603802372:AAEvPm0-I1z-CdpQbBCKwlrPAmPLzOqIcWo";
const webAppUrl = "https://phenomenal-cucurucho-5bcc04.netlify.app/";
const PORT = 8000;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text == "/start") {
    await bot.sendMessage(
      chatId,
      "Hello and welcome, below will appear a button, fill the form, please",
      {
        reply_markup: {
          keyboard: [
            [{ text: "Fill the form", web_app: { url: webAppUrl + "/form" } }],
          ],
        },
      }
    );
  }

  await bot.sendMessage(
    chatId,
    "Click the button below to open our online-shop",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open shop",
              web_app: {
                url: webAppUrl,
              },
            },
          ],
        ],
      },
    }
  );

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data.data);

      await bot.sendMessage(
        chatId,
        `Your country: ${data?.country}, city: ${data?.city}, street: ${data?.street}`
      );

      setTimeout(
        async () =>
          await bot.sendMessage(chatId, "Thanks for details, order is created"),
        2000
      );
    } catch (error) {
      console.log(error);
    }
  }
});

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice } = req.data;

  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      title: "Success purchase",
      input_message_content: {
        message_text: `Thanks for your order, dear! The cost of your purchase: ${totalPrice}BYN`,
      },
    });

    return res.status(200).json({});
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      title: "Failed purchase",
      input_message_content: {
        message_text: `Whoops, failed purchase, please check details..`,
      },
    });

    return res.status(200).json({});
  }
});

app.listen(PORT, () => console.log("start"));
