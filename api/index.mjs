import { Telegraf, Markup } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();

const bot = new Telegraf(process.env.TOKEN);
// const SECRET_HASH = "32e58fbahey833349df3383dc910e180";

//setting webhook to receive updates
app.use(await bot.createWebhook({domain: process.env.WEBHOOK_DOMAIN, path: '/api/'}))

//local route
// app.use("/", (req, res) => {
//   bot.launch();
// });

//Initial message and entrypoint
bot.start((ctx) => {
  const photo =
    "https://instagram.fccm2-1.fna.fbcdn.net/v/t51.2885-15/333171007_5984120695037196_245506842773113983_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=instagram.fccm2-1.fna.fbcdn.net&_nc_cat=100&_nc_ohc=Pq5JW1iLYH8AX8hSIkK&edm=ACWDqb8BAAAA&ccb=7-5&ig_cache_key=MzA1NDk1MjY4NzQxMDY4NTQyMg%3D%3D.2-ccb7-5&oh=00_AfC1Z57_wLEktVizsI5thVi9lcCwM7IqHVOFEelJR6tcFQ&oe=64EE90EB&_nc_sid=ee9879";
  ctx.replyWithPhoto(photo, {
    caption: "Oi amor, achou meu bot é? Vem navegar comigo.",
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
      Markup.button.callback("🛥 Socar meu Yatch nesse porto", "test"),
      Markup.button.callback("📹 Meus Packs", "packs"),
    ])
      .oneTime()
      .resize(),
  });
});

bot.action("test", (ctx) => {
  ctx.reply("Oxi, calma lá!");
});

bot.action("packs", (ctx) => {
    ctx.reply("Tá querendo me ver é?");
  });

// bot.telegram.sendMessage(6588724288, "Alá hein");
bot.hears("Oi", (ctx) => ctx.reply("Mandou oi"));

app.listen(3000);

export default app;
