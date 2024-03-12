import { Markup } from "telegraf";
import botConfigSchema from "../schemas/BotConfig.mjs";
import { getModelByTenant } from "./tenantUtils.mjs";

/**
 * @async
 * @param {*} ctx 
 * @returns a ctx.reply with btns asking which chats should be broadcasted the cb values are target_vip, target_preview, target_all
 */
export default async function chatsFilter(ctx){
    let keyboardBtns = [];
      const botConfigsModel = getModelByTenant(
        ctx.session.db,
        "BotConfig",
        botConfigSchema
      );
      const botConfigs = await botConfigsModel.findOne().lean();

      if(botConfigs === null){
        await ctx.reply('Você precisa configurar primeiro o grupo de Prévias e/ou de VIPs para que o bot consiga enviar neles');
        await ctx.scene.leave();
        return;
      }

      if (botConfigs.vip_chat_id) {
        keyboardBtns.push([Markup.button.callback("Grupo VIP", "target_vip")]);
      }

      if (botConfigs.preview_chat_id) {
        keyboardBtns.push([
          Markup.button.callback("Grupo de Prévias", "target_preview"),
        ]);
      }

      if (keyboardBtns.length > 1) {
        keyboardBtns.push([Markup.button.callback("Todos", "target_all")]);
      }

      await ctx.reply(
        "Selecione para qual grupo você irá divulgar e vender esse pack. O filtro escolhido indicará quem verá o pack em Packs no menu",
        {
          ...Markup.inlineKeyboard(keyboardBtns),
        }
      );

      return {preview_chat_id: botConfigs.preview_chat_id, vip_chat_id: botConfigs.preview_chat_id}
}