//configure to read .env file
require("dotenv").config();
const {Telegraf} = require('telegraf');

// const BASE_PATH = (process.env.VERCEL_ENV === 'production') ? "https://telegram-bot-teste-psi.vercel.app" : "";

const bot = new Telegraf(process.env.TOKEN);

// HANDLE OUR CONNECTION WITH TELEGRAM
  bot
    .launch({
      webhook: {
        domain: process.env.WEBHOOK_DOMAIN,
        port: process.env.PORT,
      },
    })
    .then(() => console.log("👍 Webhook listening on:", process.env.PORT));

//answer when Myself send message
bot.telegram.sendMessage(6588724288, "Alá hein");

bot.start((ctx) => ctx.reply("VAI COMEÇAR A PUTARIA!"));
bot.hears("Oi", (ctx) => ctx.reply("Salve bonito"));
