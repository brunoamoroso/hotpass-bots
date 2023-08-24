const {Telegraf} = require('telegraf');

module.exports = (req, res) => {
    try{
        const bot = new Telegraf(process.env.TOKEN);

        const {body} = req;

        bot.telegram.sendMessage(6588724288, "Alá hein");
    }catch(error){
        console.log(error);
    }
}