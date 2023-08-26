import { Telegraf } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";

configDotenv();
const app = express();

const BASE_PATH = "https://telegram-bot-teste-psi.vercel.app/api/";

const bot = new Telegraf(process.env.TOKEN);
// const SECRET_HASH = "32e58fbahey833349df3383dc910e180";
app.use(await bot.createWebhook({domain: process.env.WEBHOOK_DOMAIN}))

export default app;
// app.post('/', (req, res) => {
//     bot.launch({
//         webhook: { domain: process.env.TOKEN}
//     })
//     res.status(200).send('ok');
// })

// app.listen(3000, () => { console.log('listening 3000')});
