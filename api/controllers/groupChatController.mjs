import { getModelByTenant } from "../utils/tenantUtils.mjs";
import botConfigSchema from "../schemas/BotConfig.mjs";

export const setVipChat = async (ctx) => {
    try {
        const BotConfig = getModelByTenant(ctx.session.db, "BotConfig", botConfigSchema);
        await BotConfig.findOneAndUpdate(undefined, {vip_chat_id: ctx.chat.id}, {
            new: true,
            upsert: true,
        });
        await ctx.telegram.sendMessage(6588724288, `✅ Grupo VIP foi definido para o ${ctx.chat.type} com o nome de ${ctx.chat.title}`);
    }catch(err){
        console.log(err);
    }
}

export const setPreviewChat = async (ctx) => {
    try{
        const BotConfig = getModelByTenant(ctx.session.db, "BotConfig", botConfigSchema);
        const preview = await BotConfig.findOneAndUpdate(undefined, {preview_chat_id: ctx.chat.id}, {
            new: true,
            upsert: true,
        });
        await ctx.telegram.sendMessage(6588724288, `✅ Grupo de Prévias foi definido para o ${ctx.chat.type} com o nome de ${ctx.chat.title} `);
    }catch(err){
        console.log(err);
    }
}