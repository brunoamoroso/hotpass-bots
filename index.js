require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TOKEN);



  bot.telegram.sendMessage(6588724288, "Alá hein");
  bot.hears("Oi", (ctx) => {
    ctx.reply("Salve");
  });
  bot.launch();

      
  