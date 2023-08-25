import { Telegraf } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();

const BASE_PATH = "https://telegram-bot-teste-psi.vercel.app/api/";

const bot = new Telegraf(process.env.TOKEN);
const SECRET_HASH = "32e58fbahey833349df3383dc910e180";
bot.telegram.setWebhook(BASE_PATH);


app.use(express.urlencoded({
    extended: true
}));

app.use(bot.webhookCallback('/'));
app.use('/', (req, res) => {
  res.status(200).send('Entrei');
})
//middleware to enable POST method from telegram
app.post('api/', (req, res, next) => {
    bot.telegram.sendMessage(6588724288, "Alá hein");
    bot.hears("Oi", (ctx) => {
      ctx.reply("Salve");
    });
    
  
    res.status(200).send("OK");
})

app.listen(80, () => console.log('listening on 80'));

export default app;

// app.use(express.urlencoded({
//     extended: true
// }))

// app.use(express.json());

// app.post('/', (req, res) => {
//     bot.launch({
//         webhook: { domain: process.env.TOKEN}
//     })
//     res.status(200).send('ok');
// })

// app.listen(3000, () => { console.log('listening 3000')});
