// //configure to read .env file
// require('dotenv').config();

// import {VercelRequest, VercerlResponse} from 'vercel/@node';
// import { Telegraf, TelegrafContext } from 'telegraf';

// export const TOKEN = process.env.TOKEN;
// // const BASE_PATH = (process.env.VERCEL_ENV === 'production') ? "https://telegram-bot-teste-psi.vercel.app" : "";

// const bot = new Telegraf(process.env.TOKEN);
// bot.telegram.setWebhook('https://telegram-bot-teste-psi.vercel.app');
// bot.

// // HANDLE OUR CONNECTION WITH TELEGRAM
// export default async (req, res) => {
//     try{
//         const {body, query, } = req;
//         bot
//         .launch(
//             {
//                 webhook:{
//                     domain: process.env.WEBHOOK_DOMAIN, port: process.env.PORT
//                 }
//             }
//         )
//         .then(() => console.log('👍 Webhook listening on:', port));

//     }catch(error){
//         console.log('❌ Deu problema aqui hein');
//         console.log(error.toString());
//     }

//     res.status(200).send('✅ Tudo certo!');
// }

// https://www.marclittlemore.com/serverless-telegram-chatbot-vercel/