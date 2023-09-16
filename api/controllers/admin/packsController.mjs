import { Markup, Scenes } from "telegraf";
import * as packModel from "../../models/admin/packsModel.mjs";
import mainMenu from "../../mainMenu.mjs";

export const sendMenu = (ctx) => {
  ctx.reply("Entendido\\. O que você quer fazer nos Packs?", {
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Criar Pack", "createPack")],
      [Markup.button.callback("Ver Packs Ativos", "viewPacks")],
    ])
      .oneTime()
      .resize(),
  });
};

export const createPack = new Scenes.BaseScene("createPackScene");

createPack.enter((ctx) => {
  ctx.reply(
    "Comece me enviando a prévia do conteúdo. Pode ser uma foto ou um vídeo"
  );
  ctx.scene.session.step = 0;
  ctx.scene.session.packData = { user_id: ctx.callbackQuery.message.from.id }
});

createPack.on(
  "message",
  (ctx, next) => {
    //receives preview content
    if (ctx.scene.session.step === 0) {
      if (ctx.message.photo) {
        ctx.scene.session.packData.mediaPreview = ctx.message.photo[0].file_id;
        ctx.scene.session.packData.mediaPreviewType = "photo";
        ctx.scene.session.step = 1;
        next();
      } else if (ctx.message.video) {
        ctx.scene.session.packData.mediaPreview = ctx.message.video.file_id;
        ctx.scene.session.packData.mediaPreviewType = "video";
        ctx.scene.session.step = 1;
        next();
      } else {
        ctx.reply(
          "Desculpa, mas se não for foto ou vídeo não consigo avançar na criação de Pack"
        );
      }
    } else {
      next();
    }
  },
  (ctx, next) => {
    //receives description
    if (ctx.scene.session.step === 1) {
      ctx.reply("Envie uma descrição para o pack");
      ctx.scene.session.step = 2;
    } else {
      next();
    }
  },
  (ctx, next) => {
    if (ctx.scene.session.step === 2) {
      ctx.scene.session.packData.description = ctx.message.text;
      ctx.reply("Quanto vai custar o pack?");
      ctx.scene.session.step = 3;
    } else {
      next();
    }
  },
  (ctx, next) => {
    if (ctx.scene.session.step === 3) {
      ctx.scene.session.packData.price = ctx.message.text;
      ctx.reply(
        "Agora me envie o conteúdo do pack. Fotos e vídeos que serão enviados quando o cliente comprar o pack. Quando tiver enviado todo o conteúdo volte e clique no botão abaixo ⤵️",
        {
          ...Markup.inlineKeyboard([
            Markup.button.callback("✅ Enviei todo o conteúdo", "contentPackDone"),
          ]),
        }
      );
      ctx.scene.session.step = 4;
    }else{
      next();
    }
  },
  (ctx, next) => {
    if (ctx.scene.session.step === 4) {
      console.log(ctx.message.photo);
      if(!ctx.scene.session.packData.content){
        if(ctx.message.photo){
          ctx.scene.session.packData.content = [{ type: "photo", media: ctx.message.photo[0].file_id}]
        }

        if(ctx.message.video){
          ctx.scene.session.packData.content = [{ type: "video", media: ctx.message.video.file_id}]
        }
      }else{
        if(ctx.message.photo){
          ctx.scene.session.packData.content.push({ type: "photo", media: ctx.message.photo[0].file_id });
        }

        if(ctx.message.video){
          ctx.scene.session.packData.content.push({ type: "video", media: ctx.message.video.file_id });
        }
      }
    }else {
      next();
    }
  }
);

createPack.action("contentPackDone", async (ctx) => {
  await ctx.reply("Certo, vamos para a revisão");
  ctx.scene.session.step = 5;

  if(ctx.scene.session.packData.mediaPreviewType === "photo"){
   await ctx.replyWithPhoto(
      ctx.scene.session.packData.mediaPreview,
      {
        parse_mode: "MarkdownV2",
        caption: ctx.scene.session.packData.description
      }
    )
  }

  if(ctx.scene.session.packData.mediaPreviewType === "video"){
   await ctx.replyWithVideo(
      ctx.scene.session.packData.mediaPreview,
      {
        parse_mode: "MarkdownV2",
        caption: ctx.scene.session.packData.description
      }
    )
  }

  await ctx.reply("\*_O preço que será cobrado:_*\nR$" + ctx.scene.session.packData.price.replace(".", "\\."), {
    parse_mode: "MarkdownV2"
  })

  await ctx.reply("\*_O conteúdo que será enviado na compra_*", { parse_mode: "MarkdownV2"});
  await ctx.replyWithMediaGroup(ctx.scene.session.packData.content);


  await ctx.reply("O que deseja fazer?", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("✅ Salvar", "save")],
      [Markup.button.callback("❌ Descartar", "cancel")]
    ])
  })
});

createPack.action("save", (ctx) => {
  packModel.savePack(ctx.scene.session.packData).then(resp => {
    ctx.reply(resp.message);
  })
})

createPack.action("cancel", async (ctx) => {
  await ctx.reply("Saindo da Criação de Packs \n________________________");
  ctx.scene.leave();
})

createPack.leave((ctx) => {
  mainMenu(ctx);
})