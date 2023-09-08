import { Telegraf, Markup } from "telegraf";

class AdsController {
  constructor(ctx) {
    this.ctx = ctx;
  }

  sendAdsMenu() {
    this.ctx.reply("Entendido. O que você quer fazer nos anúncios?", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        Markup.button.callback("Criar Anúncio", "createAd"),
        Markup.button.callback("Ver Anúncios Ativos", "viewAds"),
      ])
        .oneTime()
        .resize(),
    });
  }

  setPreviewContent() {
    
  }
}

export default AdsController;
