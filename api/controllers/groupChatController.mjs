import { getModelByTenant } from "../utils/tenantUtils.mjs";
import botConfigSchema from "../schemas/BotConfig.mjs";

export const setVipGroup = async (ctx) => {
    try{
        const BotConfig = getModelByTenant(ctx.session.db, "BotConfig", botConfigSchema);
        const VipGroup = new BotConfig({channel_id: ctx.chat.id});

        await VipGroup.save();
        await ctx.reply('✅ Definido como o Vip');
    }catch(err){
        console.log(err);
    }
}