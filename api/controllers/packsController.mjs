// import { Markup, Scenes } from "telegraf";
// import * as packModel from "../models/packsModel.mjs";
// import mainMenu from "../mainMenu.mjs";

// export const sendMenu = (ctx) => {
//   ctx.reply("Entendido\\. O que você quer fazer nos Packs?", {
//     parse_mode: "MarkdownV2",
//     ...Markup.inlineKeyboard([
//       [Markup.button.callback("Criar Pack", "createPack")],
//       [Markup.button.callback("Ver Packs Ativos", "viewPacks")],
//     ])
//       .oneTime()
//       .resize(),
//   });
// };

// export const createPack = new Scenes.BaseScene("createPackScene");

// createPack.enter((ctx) => {
//   ctx.reply(
//     "Comece me enviando a prévia do conteúdo. Pode ser uma foto ou um vídeo"
//   );
//   ctx.scene.session.step = 0;
//   ctx.scene.session.packData = { user_id: ctx.chat.id };
// });

// createPack.on(
//   "message",
//   (ctx, next) => {
//     //receives preview content
//     if (ctx.scene.session.step === 0) {
//       if (ctx.message.photo) {
//         ctx.scene.session.packData.mediaPreview = ctx.message.photo[0].file_id;
//         ctx.scene.session.packData.mediaPreviewType = "photo";
//         ctx.scene.session.step = 1;
//         next();
//       } else {
//         ctx.reply(
//           "Desculpa, mas para o preview só aceitamos foto porque o telegram só aceita foto na hora de enviar a cobrança confirmado o produto que está sendo comprado"
//         );
//       }
//     } else {
//       next();
//     }
//   },
//   (ctx, next) => {
//     if (ctx.scene.session.step === 1) {
//       ctx.reply("Envie um título para o seu pack");
//       ctx.scene.session.step = 2;
//     } else {
//       next();
//     }
//   },
//   (ctx, next) => {
//     //receives title
//     if (ctx.scene.session.step === 2) {
//       ctx.scene.session.packData.title = ctx.message.text;
//       ctx.reply("Envie uma descrição para o pack");
//       ctx.scene.session.step = 3;
//     } else {
//       next();
//     }
//   },
//   (ctx, next) => {
//     //receives description
//     if (ctx.scene.session.step === 3) {
//       ctx.scene.session.packData.description = ctx.message.text;
//       ctx.reply("Quanto vai custar o pack?");
//       ctx.scene.session.step = 4;
//     } else {
//       next();
//     }
//   },
//   (ctx, next) => {
//     if (ctx.scene.session.step === 4) {
//       ctx.scene.session.packData.price = ctx.message.text;
//       ctx.reply(
//         "Agora me envie o conteúdo do pack. \nFotos e vídeos que serão enviados quando o cliente comprar o pack. \n\nQuando você tiver enviado todos os itens do pack e eles estiverem com os dois ✓✓. Então clique no botão abaixo ⤵️",
//         {
//           ...Markup.inlineKeyboard([
//             Markup.button.callback(
//               "✅ Enviei todo o conteúdo",
//               "contentPackDone"
//             ),
//           ]),
//         }
//       );
//       ctx.scene.session.step = 5;
//     } else {
//       next();
//     }
//   },
//   (ctx, next) => {
//     if (ctx.scene.session.step === 5) {
//       if (!ctx.scene.session.packData.content) {
//         if (ctx.message.photo) {
//           ctx.scene.session.packData.content = [
//             { type: "photo", media: ctx.message.photo[0].file_id },
//           ];
//         }

//         if (ctx.message.video) {
//           ctx.scene.session.packData.content = [
//             { type: "video", media: ctx.message.video.file_id },
//           ];
//         }
//       } else {
//         if (ctx.message.photo) {
//           ctx.scene.session.packData.content.push({
//             type: "photo",
//             media: ctx.message.photo[0].file_id,
//           });
//         }

//         if (ctx.message.video) {
//           ctx.scene.session.packData.content.push({
//             type: "video",
//             media: ctx.message.video.file_id,
//           });
//         }
//       }
//     } else {
//       next();
//     }
//   }
// );

// createPack.action("contentPackDone", async (ctx) => {
//   await ctx.reply("Certo, vamos para a revisão");
//   ctx.scene.session.step = 6;

//   if (ctx.scene.session.packData.mediaPreviewType === "photo") {
//     await ctx.replyWithPhoto(ctx.scene.session.packData.mediaPreview, {
//       parse_mode: "MarkdownV2",
//       caption:
//         ctx.scene.session.packData.title.replace(".", "\\.") +
//         "\n" +
//         ctx.scene.session.packData.description.replace(".", "\\."),
//     });
//   }

//   if (ctx.scene.session.packData.mediaPreviewType === "video") {
//     await ctx.replyWithVideo(ctx.scene.session.packData.mediaPreview, {
//       parse_mode: "MarkdownV2",
//       caption: ctx.scene.session.packData.description,
//     });
//   }

//   await ctx.reply(
//     "*_O preço que será cobrado:_*\nR$" +
//       ctx.scene.session.packData.price.replace(".", "\\."),
//     {
//       parse_mode: "MarkdownV2",
//     }
//   );

//   await ctx.reply("*_O conteúdo que será enviado na compra_*", {
//     parse_mode: "MarkdownV2",
//   });
//   await ctx.replyWithMediaGroup(ctx.scene.session.packData.content);

//   await ctx.reply("O que deseja fazer?", {
//     ...Markup.inlineKeyboard([
//       [Markup.button.callback("✅ Salvar", "save")],
//       [Markup.button.callback("❌ Descartar", "cancel")],
//     ]),
//   });
// });

// createPack.action("save", (ctx) => {
//   packModel.savePack(ctx.scene.session.packData).then((resp) => {
//     ctx.reply(resp.message);
//   });
// });

// createPack.action("cancel", async (ctx) => {
//   await ctx.reply("Saindo da Criação de Packs \n________________________");
//   ctx.scene.leave();
// });

// createPack.leave((ctx) => {
//   mainMenu(ctx);
// });

// export const viewPacks = new Scenes.BaseScene("viewPacksScene");

// viewPacks.enter((ctx) => {
//   packModel.getPacks().then((packs) => {
//     packs.forEach((pack) => {
//       if (pack.media_preview_type === "photo") {
//         ctx.replyWithPhoto(pack.media_preview, {
//           parse_mode: "MarkdownV2",
//           caption:
//             pack.description +
//             `\n\n\n\*_Preço cobrado pelo pack: _*\n${pack.price.replace(
//               ".",
//               "\\."
//             )}`,
//           ...Markup.inlineKeyboard([
//             [Markup.button.callback("👀 Ver conteúdos do Pack", "viewContent")],
//             [Markup.button.callback("❌ Desativar Pack", "disablePack")],
//           ]),
//         });
//       }

//       if (pack.media_preview_type === "video") {
//         ctx.replyWithVideo(pack.media_preview, {
//           parse_mode: "MarkdownV2",
//           caption:
//             pack.description +
//             `\n\n\n\*_Preço cobrado pelo pack: _*\n${pack.price.replace(
//               ".",
//               "\\."
//             )}`,
//           ...Markup.inlineKeyboard([
//             [Markup.button.callback("👀 Ver conteúdos do Pack", "viewContent")],
//             [Markup.button.callback("❌ Desativar Pack", "disablePack")],
//           ]),
//         });
//       }
//     });
//   });
// });

// export const buyPacks = new Scenes.BaseScene("buyPacksScene");

// buyPacks.enter((ctx) => {
//   ctx.session.chat = ctx.chat.id;
//   packModel.getPacks().then((packs) => {
//     packs.forEach((pack) => {
//       if (pack.media_preview_type === "photo") {
//         ctx.replyWithPhoto(pack.media_preview, {
//           parse_mode: "Markdownv2",
//           caption:
//             "*" +
//             pack.title.replace(".", "\\.") +
//             "*" +
//             "\n\n" +
//             pack.description.replace(".", "\\."),
//           ...Markup.inlineKeyboard([
//             Markup.button.callback("Comprar - R$" + pack.price, pack.id),
//           ]),
//         });
//       } else if (pack.media_preview_type === "video") {
//       }
//     });
//   });
// });

// buyPacks.on("callback_query", async (ctx) => {
//   const pack = await packModel.getPackById(ctx.callbackQuery.data);
//   ctx.sendInvoice({
//     photo_url: await ctx.replyWithPhoto(pack.media_preview),
//     chat_id: ctx.chat.id,
//     title: "Pack",
//     description: `Esse pack contém ${pack.contentQty} itens para você`,
//     payload: { userId: ctx.chat.id, packId: ctx.callbackQuery.data },
//     provider_token: process.env.STRIPE_KEY,
//     currency: "BRL",
//     prices: [{ label: "Preço", amount: pack.price.replace(".", "") }],
//   });

//   ctx.scene.session.pack_bought = pack.id;
// });

// buyPacks.on("pre_checkout_query", (ctx) => {
//   ctx.answerPreCheckoutQuery(true);
// });

// buyPacks.on("message", (ctx) => {
//   if (ctx.message.successful_payment) {
//     ctx.reply("Toma meu pack 😏");
//     const payload = JSON.parse(ctx.message.successful_payment.invoice_payload);
//     packModel.getPackContentById(payload.packId).then((pack) => {
//       let adjustedPackContent = [];
//       pack[0].content.forEach((packContent) => {
//         adjustedPackContent.push({
//           media: packContent.media_id,
//           type: packContent.media_type,
//         });
//       });

//       ctx.sendMediaGroup(adjustedPackContent, {
//         protect_content: true,
//       });

//       packModel.insertPackBought(payload.userId, payload.packId);
//     });
//   }
// });
