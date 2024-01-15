import { Markup, Scenes } from "telegraf";
import packSchema from "../schemas/Pack.mjs";
import userSchema from "../schemas/User.mjs";
import { getModelByTenant } from "../utils/tenantUtils.mjs";

//only for Admins
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

export const createPack = new Scenes.BaseScene("createPack");

createPack.enter(async (ctx) => {
  ctx.scene.session.step = 0;
  ctx.scene.session.packData = {
    user: {
      telegram_id: ctx.chat.id,
      first_name: ctx.chat.first_name,
      last_name: ctx.chat.last_name,
      username: ctx.chat.username,
    },
  };
  await ctx.reply(
    "Comece me enviando a prévia do conteúdo. Pode ser uma foto ou um vídeo"
  );
});

createPack.on(
  "message",
  async (ctx, next) => {
    //receives preview content
    if (ctx.scene.session.step === 0) {
      if (ctx.message.photo) {
        ctx.scene.session.packData.mediaPreview = ctx.message.photo[0].file_id;
        ctx.scene.session.packData.mediaPreviewType = "photo";
        ctx.scene.session.step = 1;
        next();
      } else {
        await ctx.reply(
          "Desculpa, mas para o preview só aceitamos foto porque o telegram só aceita foto na hora de enviar a cobrança confirmado o produto que está sendo comprado"
        );
      }
    } else {
      next();
    }
  },
  async (ctx, next) => {
    if (ctx.scene.session.step === 1) {
      ctx.scene.session.step = 2;
      await ctx.reply("Envie um título para o seu pack");
    } else {
      next();
    }
  },
  async (ctx, next) => {
    //receives title
    if (ctx.scene.session.step === 2) {
      ctx.scene.session.packData.title = ctx.message.text;
      ctx.scene.session.step = 3;
      await ctx.reply("Envie uma descrição para o pack");
    } else {
      next();
    }
  },
  async (ctx, next) => {
    //receives description
    if (ctx.scene.session.step === 3) {
      ctx.scene.session.packData.description = ctx.message.text;
      ctx.scene.session.step = 4;
      await ctx.reply("Quanto vai custar o pack?");
    } else {
      next();
    }
  },
  async (ctx, next) => {
    if (ctx.scene.session.step === 4) {
      ctx.scene.session.packData.price = ctx.message.text;
      ctx.scene.session.step = 5;
      await ctx.reply(
        "Agora me envie o conteúdo do pack. \nFotos e vídeos que serão enviados quando o cliente comprar o pack. \n\nQuando você tiver enviado todos os itens do pack e eles estiverem com os dois ✓✓. Então clique no botão abaixo ⤵️",
        {
          ...Markup.inlineKeyboard([
            Markup.button.callback(
              "✅ Enviei todo o conteúdo",
              "contentPackDone"
            ),
          ]),
        }
      );
    } else {
      next();
    }
  },
  async (ctx, next) => {
    if (ctx.scene.session.step === 5) {
      if (!ctx.scene.session.packData.content) {
        if (ctx.message.photo) {
          ctx.scene.session.packData.content = [
            { type: "photo", media: ctx.message.photo[0].file_id },
          ];
        }

        if (ctx.message.video) {
          ctx.scene.session.packData.content = [
            { type: "video", media: ctx.message.video.file_id },
          ];
        }
      } else {
        if (ctx.message.photo) {
          ctx.scene.session.packData.content.push({
            type: "photo",
            media: ctx.message.photo[0].file_id,
          });
        }

        if (ctx.message.video) {
          ctx.scene.session.packData.content.push({
            type: "video",
            media: ctx.message.video.file_id,
          });
        }
      }
    } else {
      next();
    }
  }
);

createPack.action("contentPackDone", async (ctx) => {
  await ctx.reply("Certo, vamos para a revisão");
  ctx.scene.session.step = 6;

  if (ctx.scene.session.packData.mediaPreviewType === "photo") {
    await ctx.replyWithPhoto(ctx.scene.session.packData.mediaPreview, {
      parse_mode: "MarkdownV2",
      caption:
        ctx.scene.session.packData.title.replace(".", "\\.") +
        "\n" +
        ctx.scene.session.packData.description.replace(".", "\\."),
    });
  }

  if (ctx.scene.session.packData.mediaPreviewType === "video") {
    await ctx.replyWithVideo(ctx.scene.session.packData.mediaPreview, {
      parse_mode: "MarkdownV2",
      caption: ctx.scene.session.packData.description,
    });
  }

  await ctx.reply(
    "*_O preço que será cobrado:_*\nR$" +
      ctx.scene.session.packData.price.replace(".", "\\."),
    {
      parse_mode: "MarkdownV2",
    }
  );

  await ctx.reply("*_O conteúdo que será enviado na compra_*", {
    parse_mode: "MarkdownV2",
  });
  await ctx.replyWithMediaGroup(ctx.scene.session.packData.content);

  await ctx.reply("O que deseja fazer?", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("✅ Salvar", "save")],
      [Markup.button.callback("❌ Descartar", "cancel")],
    ]),
  });
});

createPack.action("save", async (ctx) => {
  const Pack = getModelByTenant(ctx.session.db, "Pack", packSchema);
  try {
    const packData = ctx.scene.session.packData;
    const formatPackPrice = parseInt(packData.price.replace(".", "").replace(",", ""));
    const newPack = new Pack({
      media_preview: packData.mediaPreview,
      media_preview_type: packData.mediaPreviewType,
      title: packData.title,
      description: packData.description,
      price: formatPackPrice,
      content: packData.content,
      who_created: packData.user,
    });

    newPack.save();

    await ctx.reply("O pack foi criado com sucesso!");

    return ctx.scene.leave();
  } catch (err) {
    console.log(err);
  }
});

createPack.action("cancel", async (ctx) => {
  await ctx.reply("Saindo da Criação de Packs \n________________________");
  return ctx.scene.leave();
});

export const viewPacks = new Scenes.WizardScene(
  "viewPacks",
  async (ctx) => {
    const Pack = getModelByTenant(ctx.session.db, "Pack", packSchema);
    const packs = await Pack.find({ status: "enabled" }).lean();

    for (let i = 0; i < packs.length; i++) {
      const pack = packs[i];
      if (pack.media_preview_type === "photo") {
        await ctx.replyWithPhoto(pack.media_preview, {
          parse_mode: "MarkdownV2",
          caption:
            pack.description.replace(".", "\\.") +
            `\n\n\n\*_Preço cobrado pelo pack: _*\n${pack.price.replace(
              ".",
              "\\."
            )}`,
          ...Markup.inlineKeyboard([
            [Markup.button.callback("👀 Ver conteúdos do Pack", "viewContent")],
            [Markup.button.callback("❌ Desativar Pack", "disablePack")],
          ]),
        });
      }

      if (pack.media_preview_type === "video") {
        await ctx.replyWithVideo(pack.media_preview, {
          parse_mode: "MarkdownV2",
          caption:
            pack.description.replace(".", "\\.") +
            `\n\n\n\*_Preço cobrado pelo pack: _*\n${pack.price.replace(
              ".",
              "\\."
            )}`,
          ...Markup.inlineKeyboard([
            [Markup.button.callback("👀 Ver conteúdos do Pack", "viewContent")],
            [Markup.button.callback("❌ Desativar Pack", "disablePack")],
          ]),
        });
      }
    }
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.callbackQuery.data) {
      return ctx.scene.leave();
    } else {
      ctx.reply("Se você precisa sair clique em /sair");
      return ctx.scene.leave();
    }
  }
);

export const buyPacks = new Scenes.BaseScene("buyPacks");

buyPacks.enter(async (ctx) => {
  ctx.session.user = ctx.chat;
  const Pack = getModelByTenant(ctx.session.db, "Pack", packSchema);
  const packs = await Pack.find({ status: "enabled" }).lean();

  for (let i = 0; i < packs.length; i++) {
    const pack = packs[i];
    if (pack.media_preview_type === "photo") {
      const checkoutURL = process.env.CHECKOUT_DOMAIN + ctx.session.botName + '/' + ctx.from.id + '/' + pack._id;
      await ctx.replyWithPhoto(pack.media_preview, {
        parse_mode: "Markdownv2",
        caption:
          "*" +
          pack.title.replace(".", "\\.") +
          "*" +
          "\n\n" +
          pack.description.replace(".", "\\."),
        ...Markup.inlineKeyboard([
          Markup.button.url("Comprar - R$" + pack.price, checkoutURL),
        ]),
      });
    } else if (pack.media_preview_type === "video") {
    }
  }

  return;
});

// buyPacks.on("callback_query", async (ctx) => {
//   const Pack = getModelByTenant(ctx.session.db, "Pack", packSchema);
//   const pack = await Pack.findById(ctx.callbackQuery.data);
//   ctx.sendInvoice({
//     photo_url: await ctx.replyWithPhoto(pack.media_preview),
//     chat_id: ctx.chat.id,
//     title: "Pack",
//     description: `Esse pack contém ${pack.content.length} itens para você`,
//     payload: { userId: ctx.chat.id, packId: ctx.callbackQuery.data },
//     provider_token: process.env.STRIPE_KEY,
//     currency: "BRL",
//     prices: [{ label: "Preço", amount: pack.price.replace(".", "") }],
//   });
// });

// buyPacks.on("message", async (ctx) => {
//   const Pack = getModelByTenant(ctx.session.db, "Pack", packSchema);
//   const User = getModelByTenant(ctx.session.db, "User", userSchema);
//   if (ctx.message.successful_payment) {
//     await ctx.reply("Toma meu pack 😏");
//     const payload = JSON.parse(ctx.message.successful_payment.invoice_payload);
//     const packToSend = await Pack.findOne({_id: payload.packId}).lean();

//     await ctx.sendMediaGroup(packToSend.content, {
//       protect_content: true,
//     });

//     packToSend.date_bought = new Date();
//     await User.findOneAndUpdate(
//       { telegram_id: payload.userId },
//       { $push: { packs_bought: packToSend } }
//     );
//   }
//   return ctx.scene.leave();
// });
