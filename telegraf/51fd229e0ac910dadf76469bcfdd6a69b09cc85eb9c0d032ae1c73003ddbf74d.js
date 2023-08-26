import express from "express";
const app = express();

//middleware to enable POST method from telegram
app.use('/', (req, res) => {
    const {body, query} = req;
    bot.telegram.setWebhook(process.env.WEBHOOK_DOMAIN);
    bot.command('start', ctx => ctx.reply('Hello'));
    bot.telegram.sendMessage(6588724288, "Alá hein");
    bot.hears("Oi", (ctx) => {
      ctx.telegram.sendMessage('salve');
    });
  
    bot.launch();
  
    res.send('Olá');
  })
  
  app.listen(80, () => console.log('listening on 80'));