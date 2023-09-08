import { Telegraf, Markup, Scenes } from "telegraf";

class AdsController {

  constructor(ctx = "", mediaPreviewContent = "", adsDescription = ""){
    this.ctx = ctx;
    this.mediaPreviewContent = mediaPreviewContent;
    this.adsDescription = adsDescription;
  }

  setCtx(newCtx){
    this.ctx = newCtx;
  }

  sendAdsMenu() {
    this.ctx.reply("Entendido\\. O que você quer fazer nos anúncios?", {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        Markup.button.callback("Criar Anúncio", "createAd"),
        Markup.button.callback("Ver Anúncios Ativos", "viewAds"),
      ])
        .oneTime()
        .resize(),
    });
  }

  createAdsWizard = new Scenes.WizardScene(
    'createAdsScene',
    async (ctx) => {
      ctx.wizard.state.createAdsData = {};
      ctx.reply('Certo, comece me enviando prévia do conteúdo. Pode ser foto ou vídeo');
      return ctx.wizard.next();
    },
    async (ctx) => {
      if(ctx.message.photo){
         ctx.wizard.state.createAdsData.photo_file_id = ctx.message.photo[0].file_id;
      }else if(ctx.message.video){
        ctx.wizard.state.createAdsData.video_file_id = ctx.message.video.file_id;
      }
      ctx.reply('Recebi! Preciso que você me envie agora o texto que vai acompanhar o anúncio');
      return ctx.wizard.next();
    },
    async (ctx) => {
      ctx.wizard.state.createAdsData.description = ctx.message.text;
      ctx.reply('Quanto vai custar para acessar o seu conteúdo? Envie o valor utilizando vírgula ex: 29,90');
      return ctx.wizard.next();
    },
    async (ctx) => {
      ctx.wizard.state.createAdsData.price = ctx.message.text;
      ctx.reply('Para qual público vai ser enviado esse anúncio?', {
        parse_mode: 'MarkdownV2',
        ...Markup.inlineKeyboard([
          Markup.button.callback("Assinantes", "subscribers"),
          Markup.button.callback("Ex-assinantes", "unsubscribeds"),
          Markup.button.callback("Curiosos", "interested"),
        ])
        .oneTime()
        .resize()
      })
      return ctx.wizard.next();
    },
    async (ctx) => {
      ctx.wizard.state.createAdsData.target = ctx.update.callback_query.data;
      await ctx.reply('Tudo configurado. Vamos revisar seu anúncio antes de enviar ele.');

      let target = "";
      switch(ctx.wizard.state.createAdsData.target){
        case "subscribers":
            target = "Assinantes";
          break;
        case "unsubscribeds":
            target = "Ex-assinantes"
          break;
        case "interested":
            target = "Curiosos";
          break;
      }

      let reviewCaption = `*_💬 Chamada do Anúncio:_*\n${ctx.wizard.state.createAdsData.description}\n\n\n\*_🤑Preço do conteúdo:_*\nR$: ${ctx.wizard.state.createAdsData.price}\n\n\n\*_👥Público Alvo do Anúncio:_*\n${target}`;

      if(ctx.wizard.state.createAdsData.photo_file_id){
        ctx.replyWithPhoto(
          ctx.wizard.state.createAdsData.photo_file_id,
          {
            caption: reviewCaption,
            parse_mode: "MarkdownV2",
            ...Markup.inlineKeyboard([
              Markup.button.callback("✅ Salvar e Disparar", "done"),
              Markup.button.callback("🔁 Refazer Anúncio", "restart"),
            ])
          }
        )
      }else if(ctx.wizard.state.createAdsData.video_file_id){
        ctx.replyWithVideo(
          ctx.wizard.state.createAdsData.video_file_id,
          {
            caption: ctx.wizard.state.createAdsData.description + "\n" + ctx.wizard.state.createAdsData.price,
            parse_mode: "MarkdownV2",
            ...Markup.inlineKeyboard([
              Markup.button.callback("✅ Salvar e Enviar", "done"),
              Markup.button.callback("🔁 Refazer Anúncio", "restart"),
            ])
          }
        )
      }

      return ctx.wizard.next();
    },
    async (ctx) => {
      if(ctx.update.callback_query.data === 'done'){
        return;
      }else if(ctx.update.callback_query.data === 'restart'){
        ctx.reply('Sem problemas, a gente refaz até ficar tudo certinho');
        ctx.wizard.selectStep(0);
        ctx.wizard.step(ctx);
      }
    }

  );
}

export default AdsController;
