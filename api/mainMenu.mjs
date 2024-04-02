import { Markup } from "telegraf";
import { getModelByTenant } from "./utils/tenantUtils.mjs";
import botConfigSchema from "./schemas/BotConfig.mjs";

export default async function mainMenu(ctx, userRole){
  if(userRole === "admin"){
    return ctx.reply("Bem vindo ao menu de Admins", {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❤️‍🔥 Assinaturas", "subscriptions")],
        [Markup.button.callback("📹 Meus Packs", "packs")],
        [Markup.button.callback("🔗 Agregador de Links", "links")],
        [Markup.button.callback("📢 Disparo de Mensagens", "msgTrigger")],
        [Markup.button.callback("🤖 Mensagem Inicial Customizada", "customStart")],
        [Markup.button.callback("🦹‍♀️ Admins", "admins")],
      ])
    });
  }else{
    const BotConfigsModel = getModelByTenant(ctx.session.db, "BotConfig", botConfigSchema);
    const botConfigs = await BotConfigsModel.findOne().lean();
    const customerKeyboard = [
      [Markup.button.callback("❤️‍🔥 Assinaturas", "subscriptionsCustomer")],
      [Markup.button.callback("📹 Packs", "packsCustomer")],
      [Markup.button.callback("🔗 Links", "linksCustomer")],
    ];

    if(botConfigs.custom_start){
      if(botConfigs.custom_start.media.type === "photo"){
        return ctx.replyWithPhoto(botConfigs.custom_start.media.file, {
          caption: botConfigs.custom_start.caption,
          ...Markup.inlineKeyboard(customerKeyboard)
        })
      }

      if(botConfigs.custom_start.media.type === "video"){
        return ctx.replyWithVideo(botConfigs.custom_start.media.file, {
          caption: botConfigs.customStart.caption,
          ...Markup.inlineKeyboard(customerKeyboard)
        })
      }

      if(botConfigs.custom_start.text){
        return ctx.reply(botConfigs.custom_start.text, {
          ...Markup.inlineKeyboard(customerKeyboard)
        });
      }

    }

    return ctx.reply(`Bem-vindo ao meu menu ${ctx.from.first_name}, o que você quer hoje? 😈`, {
      ...Markup.inlineKeyboard(customerKeyboard)
    });
  }
};