//configure to read .env file
// require("dotenv").config();
const {Telegraf} = require('telegraf');
const express = require('express');

const app = express();

const BASE_PATH =  "https://telegram-bot-teste-psi.vercel.app";

const bot = new Telegraf(process.env.TOKEN);
const SECRET_HASH = "32e58fbahey833349df3383dc910e180"
const webhookUrl = `${BASE_PATH}/api/telegram-hook?secret_hash=${SECRET_HASH}`

app.use(await bot.createWebhook({domain: webhookUrl}));

bot.telegram.sendMessage(6588724288, "Alá hein");

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`))

// export default async(req, res) => {
//     try{
//         const { query, body } = req;

//         if(query.setWebhook === true){
//             const webhookUrl = `${BASE_PATH}/api/telegram-hook?secret_hash=${SECRET_HASH}`
//             const isSet = await bot.telegram.setWebhook(webhookUrl);
//         }

//     }catch(err){
//         console.log(err);
//     }

//     res.status(200).send('OK');
// }
// // HANDLE OUR CONNECTION WITH TELEGRAM
//   bot
//     .launch({
//       webhook: {
//         domain: process.env.WEBHOOK_DOMAIN,
//       },
//     })
//     .then(() => console.log("👍 Webhook listening on:", process.env.PORT));

// //answer when Myself send message
// bot.telegram.sendMessage(6588724288, "Alá hein");

// bot.start((ctx) => ctx.reply("VAI COMEÇAR A PUTARIA!"));
// bot.hears("Oi", (ctx) => ctx.reply("Salve bonito"));
