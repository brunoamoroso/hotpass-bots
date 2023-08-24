const {Telegraf} = require('telegraf');

const BASE_PATH =  "https://telegram-bot-teste-psi.vercel.app";

const bot = new Telegraf(process.env.TOKEN);
const SECRET_HASH = "32e58fbahey833349df3383dc910e180"

bot.telegram.sendMessage(6588724288, "Alá hein");

export default async(req, res) => {
    try{
        const { query, body } = req;

        if(query.setWebhook === true){
            const webhookUrl = `${BASE_PATH}/api/telegram-hook?secret_hash=${SECRET_HASH}`
            const isSet = await bot.telegram.setWebhook(webhookUrl);
        }

    }catch(err){
        console.log(err);
    }

    res.status(200).send('OK');
}