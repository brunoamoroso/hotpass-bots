import { Telegraf } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();

const bot = new Telegraf(process.env.TOKEN);
// const SECRET_HASH = "32e58fbahey833349df3383dc910e180";
app.use(await bot.createWebhook({domain: process.env.WEBHOOK_DOMAIN, path: '/api/'}))

app.use('/', (req, res) => {
  const {body, query } = req;
  bot.launch({webhook: {domain: process.env.WEBHOOK_DOMAIN, hookPath: '/api/'}});

  bot.start(ctx => ctx.reply('Olá'));
  bot.telegram.sendMessage(6588724288, "Alá hein");
  bot.hears('Oi', ctx => ctx.reply('Mandou oi'));
  res.send('Olá');
})


export default app;
// app.post('/', (req, res) => {
//     bot.launch({
//         webhook: { domain: process.env.TOKEN}
//     })
//     res.status(200).send('ok');
// })

// app.listen(3000, () => { console.log('listening 3000')});

// app.use(bot.web, (req, res) => {
//   const {body, query} = req;
//   bot.launch();



//   bot.start(ctx => ctx.reply('Hello'));
//   bot.telegram.sendMessage(6588724288, "Alá hein");
//   bot.hears("Oi", (ctx) => {
//     ctx.telegram.sendMessage('salve');
//   });


//   res.send('Olá');
// })