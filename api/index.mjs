import { Telegraf } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();

const BASE_PATH = "https://telegram-bot-teste-psi.vercel.app/api/";

const bot = new Telegraf(process.env.TOKEN);
// const SECRET_HASH = "32e58fbahey833349df3383dc910e180";


//middleware to enable POST method from telegram
app.use('/', (req, res) => {
  const {body, query} = req;
  // bot.command('start', ctx => ctx.reply('Hello'));
  // bot.telegram.sendMessage(6588724288, "Alá hein");
  // bot.hears("Oi", (ctx) => {
  //   ctx.telegram.sendMessage('salve');
  // });

  // bot.launch();

  res.status(200).send('Entrei');
})

app.listen(80, () => console.log('listening on 80'));

export default app;
// app.post('/', (req, res) => {
//     bot.launch({
//         webhook: { domain: process.env.TOKEN}
//     })
//     res.status(200).send('ok');
// })

// app.listen(3000, () => { console.log('listening 3000')});
