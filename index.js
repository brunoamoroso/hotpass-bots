//configure to read .env file
require('dotenv').config();

//import framework for telegram
const {Telegraf} = require('telegraf');
const {message} = require('telegraf/filters');

//set our bot
const bot = new Telegraf(process.env.TOKEN);

//answer when Myself send message
bot.telegram.sendMessage(6588724288, "Alá hein");

bot.start((ctx) => ctx.reply('VAI COMEÇAR A PUTARIA!'));
bot.hears('Oi', ctx => ctx.reply('Salve bonito'));
bot.launch();   