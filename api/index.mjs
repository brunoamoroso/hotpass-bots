import { Telegraf } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();

const BASE_PATH = "https://telegram-bot-teste-psi.vercel.app/api/";

const bot = new Telegraf(process.env.TOKEN);
// const SECRET_HASH = "32e58fbahey833349df3383dc910e180";
app.use(await bot.createWebhook({domain: process.env.WEBHOOK_DOMAIN}))

bot.launch();
bot.start(ctx => ctx.reply('Olá'))

app.listen(process.env.PORT)

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


export default app;
// app.post('/', (req, res) => {
//     bot.launch({
//         webhook: { domain: process.env.TOKEN}
//     })
//     res.status(200).send('ok');
// })

// app.listen(3000, () => { console.log('listening 3000')});
