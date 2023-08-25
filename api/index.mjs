
import { Telegraf } from 'telegraf';
import express from 'express';
import { configDotenv } from 'dotenv';

configDotenv();
const app = express();

const BASE_PATH =  "https://telegram-bot-teste-psi.vercel.app";

const bot = new Telegraf(process.env.TOKEN);
const SECRET_HASH = "32e58fbahey833349df3383dc910e180"

bot.telegram.sendMessage(6588724288, "Alá hein");
bot.hears('Oi', (ctx) => { ctx.reply('Salve')});
bot.launch();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.status(200).send('OK');
})
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