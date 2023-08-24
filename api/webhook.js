const {Telegraf} = require('telegraf');

module.exports = (req, res) => {
    console.log(req, res);
    try{
        const bot = new Telegraf(process.env.TOKEN);

        const {body} = req;

        bot.telegram.sendMessage(6588724288, "Alá hein");
        bot.start((ctx) => ctx.reply("VAI COMEÇAR A PUTARIA!"));
    }catch(error){
        console.log(error);
    }
}