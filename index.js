//configure to read .env file
require('dotenv').config();
import { Telegraf, TelegrafContext } from 'telegraf';

export const TOKEN = process.env.TOKEN;
// const BASE_PATH = (process.env.VERCEL_ENV === 'production') ? "https://telegram-bot-teste-psi.vercel.app" : "";

const bot = new Telegraf(process.env.TOKEN);
bot.telegram.setWebhook('https://telegram-bot-teste-psi.vercel.app');

// HANDLE OUR CONNECTION WITH TELEGRAM
export default async (req, res) => {
    try{
        const {body, query, } = req;
        bot
        .launch(
            {
                webhook:{
                    domain: process.env.WEBHOOK_DOMAIN, port: process.env.PORT
                }
            }
        )
        .then(() => console.log('👍 Webhook listening on:', port));

    }catch(error){
        console.log('❌ Deu problema aqui hein');
        console.log(error.toString());
    }

    res.status(200).send('✅ Tudo certo!');
}

//answer when Myself send message
bot.telegram.sendMessage(6588724288, "Alá hein");

bot.start((ctx) => ctx.reply('VAI COMEÇAR A PUTARIA!'));
bot.hears('Oi', ctx => ctx.reply('Salve bonito'));