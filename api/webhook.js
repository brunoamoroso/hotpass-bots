require('dotenv').config();
const {Telegraf} = require('telegraf');
const express = require('express');
const app = express();

const BASE_PATH =  "https://telegram-bot-teste-psi.vercel.app";

const bot = new Telegraf(process.env.TOKEN);
const SECRET_HASH = "32e58fbahey833349df3383dc910e180"

bot.telegram.sendMessage(6588724288, "Alá hein");

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json());

app.post('/', (req, res) => {
    bot.launch({
        webhook: { domain: process.env.TOKEN}
    })
    res.status(200).send('ok');
})

app.listen(3000, () => { console.log('listening 3000')});